import { useEffect, useRef, useState, useCallback } from "react";

function loadScriptOnce(src, globalCheck) {
  return new Promise((resolve) => {
    if (globalCheck()) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export default function useYouTubePlayer(playlistId) {
  const playerRef = useRef(null);
  const rafRef = useRef(null);
  const tickRef = useRef(null);
  const pendingPlay = useRef(true); // always try to play as soon as ready

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

  useEffect(() => {
    let cancelled = false;

    window.onYouTubeIframeAPIReady = () => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player("yt-audio-target", {
        height: "1",
        width: "1",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            if (pendingPlay.current) {
              playerRef.current.playVideo();
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
              const data = playerRef.current.getVideoData?.();
              setTrackName(data?.title || "Now playing");
              if (data?.video_id) {
                setThumbnail(`https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`);
              }
              startTick();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopTick();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              if (playerRef.current && playerRef.current.nextVideo) {
                playerRef.current.nextVideo();
              }
            }
          },
        },
      });
    };

    loadScriptOnce("https://www.youtube.com/iframe_api", () => !!window.YT);

    const timeoutId = setTimeout(() => {
      if (!cancelled && !playerRef.current) setApiTimedOut(true);
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      stopTick();
    };
  }, [playlistId, startTick, stopTick]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      // Player not created yet, just mark pending
      pendingPlay.current = true;
      setTrackName("Loading…");
      return;
    }
    // Player exists — call play/pause directly
    if (isPlaying) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.nextVideo();
    }
  }, []);

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
