import { useEffect, useRef, useState, useCallback } from "react";

// Preload the YouTube API script immediately (don't wait for component mount)
const ytApiPromise = new Promise((resolve) => {
  if (typeof window === "undefined") return;
  if (window.YT && window.YT.Player) {
    resolve();
    return;
  }
  // Queue callback before script loads
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (prev) prev();
    resolve();
  };
  const existing = document.querySelector(
    'script[src="https://www.youtube.com/iframe_api"]'
  );
  if (!existing) {
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  }
});

export default function useYouTubePlayer(playlistId) {
  const playerRef = useRef(null);
  const rafRef = useRef(null);
  const tickRef = useRef(null);
  const pendingPlay = useRef(false);
  const retryTimerRef = useRef(null);
  const userTappedRef = useRef(false);
  const creatingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackName, setTrackName] = useState("Tap to play");
  const [thumbnail, setThumbnail] = useState(null);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [apiTimedOut, setApiTimedOut] = useState(false);

  useEffect(() => {
    tickRef.current = () => {
      const p = playerRef.current;
      if (p && p.getCurrentTime) {
        setCur(p.getCurrentTime());
        setDur(p.getDuration());
      }
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    };
  });

  const startTick = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  }, []);

  const stopTick = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Retry play — Android sometimes needs multiple attempts
  const retryPlay = useCallback((attempts = 0) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    const p = playerRef.current;
    if (!p || attempts > 5) return;

    const state = p.getPlayerState?.();
    // -1 = unstarted, 2 = paused, 5 = cued, 0 = ended
    if (state === -1 || state === 2 || state === 5 || state === 0) {
      p.playVideo();
      retryTimerRef.current = setTimeout(() => {
        const newState = p.getPlayerState?.();
        if (newState !== 1) {
          retryPlay(attempts + 1);
        }
      }, 400);
    }
  }, []);

  const createPlayer = useCallback(() => {
    if (playerRef.current || creatingRef.current) return;
    if (!window.YT || !window.YT.Player) return;
    creatingRef.current = true;

    playerRef.current = new window.YT.Player("yt-audio-target", {
      height: "200",
      width: "200",
      playerVars: {
        listType: "playlist",
        list: playlistId,
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          if (pendingPlay.current) {
            pendingPlay.current = false;
            playerRef.current.playVideo();
            retryPlay(0);
          }
        },
        onError: () => {
          if (playerRef.current && playerRef.current.nextVideo) {
            playerRef.current.nextVideo();
          }
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            pendingPlay.current = false;
            userTappedRef.current = false;
            if (retryTimerRef.current) {
              clearTimeout(retryTimerRef.current);
              retryTimerRef.current = null;
            }
            const data = playerRef.current.getVideoData?.();
            setTrackName(data?.title || "Now playing");
            if (data?.video_id) {
              setThumbnail(
                `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`
              );
            }
            startTick();
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopTick();
            if (userTappedRef.current) {
              retryPlay(0);
            }
          } else if (e.data === window.YT.PlayerState.ENDED) {
            if (playerRef.current && playerRef.current.nextVideo) {
              playerRef.current.nextVideo();
            }
          } else if (e.data === -1) {
            // UNSTARTED — retry if user initiated
            if (userTappedRef.current || pendingPlay.current) {
              retryPlay(0);
            }
          }
        },
      },
    });
  }, [playlistId, startTick, stopTick, retryPlay]);

  // Create player eagerly as soon as API is ready
  useEffect(() => {
    let cancelled = false;

    ytApiPromise.then(() => {
      if (cancelled) return;
      createPlayer();
    });

    const timeoutId = setTimeout(() => {
      if (!cancelled && !playerRef.current) setApiTimedOut(true);
    }, 12000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      stopTick();
    };
  }, [createPlayer, stopTick]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      pendingPlay.current = true;
      userTappedRef.current = true;
      setTrackName("Loading…");
      // Try to create the player if it doesn't exist yet
      createPlayer();
      return;
    }

    if (isPlaying) {
      userTappedRef.current = false;
      p.pauseVideo();
    } else {
      userTappedRef.current = true;
      p.playVideo();
      retryPlay(0);
    }
  }, [isPlaying, retryPlay, createPlayer]);

  const nextTrack = useCallback(() => {
    if (playerRef.current) {
      userTappedRef.current = true;
      playerRef.current.nextVideo();
      retryPlay(0);
    }
  }, [retryPlay]);

  const progressPct = dur ? (cur / dur) * 100 : 0;

  return {
    isReady,
    isPlaying,
    trackName,
    thumbnail,
    cur,
    dur,
    progressPct,
    apiTimedOut,
    togglePlay,
    nextTrack,
  };
}
