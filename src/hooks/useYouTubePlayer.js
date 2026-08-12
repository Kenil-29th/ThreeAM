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

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackName, setTrackName] = useState("Tuning in…");
  const [thumbnail, setThumbnail] = useState(null);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [apiTimedOut, setApiTimedOut] = useState(false);

  // Keep the tick function in a ref so the rAF loop always uses the latest closure
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
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: () => setIsReady(true),
          onError: () => {
            if (playerRef.current && playerRef.current.nextVideo) {
              playerRef.current.nextVideo();
            }
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const data = playerRef.current.getVideoData?.();
              setTrackName(data?.title || "Now playing");
              if (data?.video_id) {
                setThumbnail(`https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`);
              }
              startTick();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopTick();
            }
          },
        },
      });
    };

    loadScriptOnce("https://www.youtube.com/iframe_api", () => !!window.YT);

    const timeoutId = setTimeout(() => {
      if (!cancelled && !playerRef.current) setApiTimedOut(true);
    }, 6000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      stopTick();
    };
  }, [playlistId, startTick, stopTick]);

  const togglePlay = useCallback(() => {
    if (!isReady || !playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isReady, isPlaying]);

  const nextTrack = useCallback(() => {
    if (!isReady || !playerRef.current) return;
    playerRef.current.nextVideo();
  }, [isReady]);

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
