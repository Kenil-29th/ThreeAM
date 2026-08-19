import { useState, useRef } from "react";
import sceneImage from "./assets/scene.png";
import useYouTubePlayer from "./hooks/useYouTubePlayer";
import useSupabasePresence from "./hooks/useSupabasePresence";

const COLORS = {
  midnight: "#0B1026",
  violet: "#3D2C5F",
  moon: "#C9CDE0",
  amber: "#E8A657",
  rose: "#8B4B5C",
  paper: "#F0EEF5",
};

const SCENE_IMAGE = sceneImage;

const YT_PLAYLIST_ID = "PL9bw4S5ePsEG1BSA7I5EtqskLWRaQojwR";
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const SPOTIFY_URL = "";
const YT_MUSIC_URL =
  "https://music.youtube.com/playlist?list=PL9bw4S5ePsEG1BSA7I5EtqskLWRaQojwR";

function fmt(t) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ThreeAM() {
  const containerRef = useRef(null);

  const {
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
  } = useYouTubePlayer(YT_PLAYLIST_ID);

  const listenerCount = useSupabasePresence(SUPABASE_URL, SUPABASE_ANON_KEY);

  const [stars] = useState(() =>
    Array.from({ length: 40 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 50,
      delay: Math.random() * 4,
    }))
  );

  const [drops] = useState(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      dur: 0.7 + Math.random() * 0.8,
      delay: Math.random() * 1.5,
    }))
  );

  return (
    <div ref={containerRef} className="tam-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .tam-root {
          width: 100%;
          height: 100dvh;
          height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: ${COLORS.paper};
          background: ${COLORS.midnight};
        }

        /* Full-screen background scene */
        .tam-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: ${COLORS.midnight};
        }
        .tam-bg-img {
          position: absolute;
          inset: 0;
          background-image: url(${SCENE_IMAGE});
          background-size: cover;
          background-position: center 30%;
          animation: kenburns 22s ease-in-out infinite;
          will-change: transform;
        }
        .tam-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(11,16,38,0.05) 0%,
            rgba(11,16,38,0.1) 45%,
            rgba(11,16,38,0.6) 72%,
            rgba(6,8,20,0.95) 100%
          );
        }

        /* Content layer */
        .tam-content {
          position: relative;
          z-index: 2;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 24px env(safe-area-inset-bottom, 20px);
          max-width: 500px;
          margin: 0 auto;
        }

        /* Header */
        .tam-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: ${COLORS.moon};
          z-index: 3;
        }

        /* Title area */
        .tam-title {
          text-align: center;
          margin-bottom: 20px;
        }
        .tam-title h1 {
          font-family: 'Cormorant', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(40px, 12vw, 64px);
          line-height: 0.9;
          margin: 0;
          color: ${COLORS.paper};
          text-shadow: 0 0 40px rgba(232,166,87,.12);
        }
        .tam-title .tagline {
          font-family: 'Cormorant', serif;
          font-style: italic;
          font-size: clamp(14px, 4vw, 18px);
          color: ${COLORS.moon};
          opacity: 0.85;
          margin-top: 6px;
        }
        .tam-title .subtitle {
          margin-top: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${COLORS.rose};
          opacity: 0.9;
        }

        /* Player card */
        .tam-player {
          background: rgba(11,16,38,0.8);
          border: 1px solid rgba(201,205,224,0.1);
          border-radius: 20px;
          padding: 16px 18px;
          margin-bottom: 16px;
        }

        .tam-player-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Disc */
        .tam-disc-wrap {
          position: relative;
          flex: none;
        }
        .tam-disc {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          border: 2.5px solid rgba(201,205,224,0.15);
          box-shadow: 0 4px 20px -4px rgba(0,0,0,.6);
          background: ${COLORS.midnight};
        }
        .tam-disc.playing { animation: spinDisc 8s linear infinite; }
        .tam-disc img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Controls */
        .tam-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tam-play {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(145deg, ${COLORS.amber}, ${COLORS.rose});
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 24px -4px rgba(232,166,87,.5);
          transition: transform .1s;
        }
        .tam-play:active { transform: scale(0.93); }
        .tam-play-pulse {
          animation: playPulse 2s ease-in-out infinite;
        }

        .tam-next {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(201,205,224,0.06);
          border: 1px solid rgba(201,205,224,0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s;
        }
        .tam-next:active { background: rgba(201,205,224,0.2); }

        /* Track info */
        .tam-info {
          flex: 1;
          min-width: 0;
        }
        .tam-track {
          font-size: 14px;
          font-weight: 500;
          color: ${COLORS.paper};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tam-radio {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.6;
          margin-top: 3px;
        }

        /* Progress */
        .tam-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.7;
        }
        .tam-bar {
          flex: 1;
          height: 3px;
          border-radius: 3px;
          background: rgba(201,205,224,0.15);
          position: relative;
          overflow: hidden;
        }
        .tam-bar-fill {
          position: absolute;
          inset: 0;
          border-radius: 3px;
          background: linear-gradient(90deg, ${COLORS.rose}, ${COLORS.amber});
        }

        /* Footer */
        .tam-footer {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.65;
          padding-bottom: 8px;
        }

        /* ---- Mobile tweaks ---- */
        @media (max-width: 400px) {
          .tam-bg-img { background-position: center 40%; }
          .tam-content { padding: 0 16px 16px; }
          .tam-header { padding: 12px 16px; }
          .tam-disc { width: 48px; height: 48px; }
          .tam-play { width: 42px; height: 42px; }
          .tam-next { width: 32px; height: 32px; }
          .tam-player { padding: 14px 14px; border-radius: 16px; }
          .tam-track { font-size: 13px; }
          .tam-title h1 { font-size: clamp(36px, 14vw, 52px); }
        }

        @media (max-width: 768px) and (min-width: 401px) {
          .tam-bg-img { background-position: center 35%; }
        }

        @media (max-height: 650px) {
          .tam-title { margin-bottom: 12px; }
          .tam-title h1 { font-size: 36px; }
          .tam-title .tagline { font-size: 13px; }
          .tam-player { padding: 12px 12px; margin-bottom: 10px; }
          .tam-disc { width: 42px; height: 42px; }
          .tam-play { width: 38px; height: 38px; }
          .tam-progress { margin-top: 10px; }
        }

        /* Landscape phones */
        @media (max-height: 500px) {
          .tam-title { margin-bottom: 8px; }
          .tam-title h1 { font-size: 28px; }
          .tam-title .tagline { display: none; }
          .tam-player { margin-bottom: 6px; padding: 10px; }
          .tam-disc { width: 36px; height: 36px; }
          .tam-play { width: 34px; height: 34px; }
          .tam-next { width: 28px; height: 28px; }
        }

        /* Animations */
        @keyframes twinkle { 0%,100%{opacity:.12} 50%{opacity:.7} }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
        @keyframes fall { 0%{transform:translateY(-40px)} 100%{transform:translateY(100vh)} }
        @keyframes kenburns {
          0%   { transform: scale(1) translate(0,0); }
          50%  { transform: scale(1.06) translate(-1%,-0.5%); }
          100% { transform: scale(1) translate(0,0); }
        }
        @keyframes spinDisc { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
        @keyframes playPulse {
          0%,100% { transform: scale(1); box-shadow: 0 6px 24px -4px rgba(232,166,87,.5); }
          50% { transform: scale(1.08); box-shadow: 0 8px 32px -2px rgba(232,166,87,.7); }
        }
        @keyframes noteFloat {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          60%  { opacity:.7; transform:translate(14px,-20px) scale(1.2); }
          100% { opacity:0; transform:translate(22px,-38px) scale(.5); }
        }
        @keyframes noteFloat2 {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          60%  { opacity:.6; transform:translate(-12px,-24px) scale(1.1); }
          100% { opacity:0; transform:translate(-20px,-42px) scale(.4); }
        }
        @keyframes noteFloat3 {
          0%   { opacity:1; transform:translate(0,0) scale(.9); }
          60%  { opacity:.5; transform:translate(8px,-28px) scale(1.1); }
          100% { opacity:0; transform:translate(4px,-46px) scale(.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tam-bg-img, .tam-disc.playing, .star, .drop, .note { animation: none !important; }
        }
      `}</style>

      {/* Background scene */}
      <div className="tam-bg" aria-hidden="true">
        <div className="tam-bg-img" />
        <div className="tam-bg-overlay" />
        {/* Rain */}
        {drops.map((d, i) => (
          <div key={i} className="drop" style={{ position: "absolute", left: `${d.left}%`, width: 1, height: 28, background: "linear-gradient(to bottom, rgba(201,205,224,0), rgba(201,205,224,.5))", animation: `fall ${d.dur}s linear infinite`, animationDelay: `${d.delay}s`, opacity: 0.4 }} />
        ))}
      </div>

      {/* Stars */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {stars.map((s, i) => (
          <div key={i} className="star" style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: 2, height: 2, borderRadius: "50%", background: COLORS.moon, animation: `twinkle 4s ease-in-out infinite`, animationDelay: `${s.delay}s` }} />
        ))}
      </div>

      {/* Header (absolute positioned at top) */}
      <header className="tam-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.amber, boxShadow: `0 0 8px ${COLORS.amber}`, animation: "pulseDot 2.2s ease-in-out infinite", display: "inline-block" }} />
          <span>{listenerCount !== null ? `${listenerCount} online` : "— online"}</span>
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          {SPOTIFY_URL && (
            <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" aria-label="Spotify" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#1ED760"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.72-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            </a>
          )}
          {YT_MUSIC_URL && (
            <a href={YT_MUSIC_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube Music" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF0000"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104A7.1 7.1 0 1 1 19.104 12 7.109 7.109 0 0 1 12 19.104zm0-13.332A6.228 6.228 0 1 0 18.228 12 6.234 6.234 0 0 0 12 5.772zM9.684 15.84V8.16L16.2 12z"/></svg>
            </a>
          )}
        </nav>
      </header>

      {/* Full-screen tap target — tap anywhere to start on first visit */}
      {!isPlaying && (
        <div
          onClick={(e) => { e.preventDefault(); togglePlay(); }}
          onTouchEnd={(e) => { e.preventDefault(); togglePlay(); }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            cursor: "pointer",
          }}
          aria-label="Tap anywhere to play"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") togglePlay(); }}
        />
      )}

      {/* Main content - pinned to bottom */}
      <div className="tam-content">
        {/* Title */}
        <div className="tam-title">
          <h1>3 AM</h1>
          <div className="tagline">the songs you play when no one can hear you</div>
          <div className="subtitle">still awake · still listening</div>
        </div>

        {/* Player */}
        <div className="tam-player" role="region" aria-label="Music player">
          <div className="tam-player-top">
            {/* Spinning disc */}
            <div className="tam-disc-wrap">
              <div className={`tam-disc ${isPlaying ? "playing" : ""}`}>
                {thumbnail ? (
                  <img src={thumbnail} alt="" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.violet, border: `2px solid ${COLORS.moon}` }} />
                  </div>
                )}
              </div>
              {isPlaying && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <span className="note" style={{ position: "absolute", top: 0, right: -6, fontSize: 13, color: COLORS.amber, animation: "noteFloat 2s ease-out infinite" }}>♪</span>
                  <span className="note" style={{ position: "absolute", top: -4, left: -2, fontSize: 11, color: COLORS.moon, animation: "noteFloat2 2.5s ease-out infinite", animationDelay: "0.8s" }}>♫</span>
                  <span className="note" style={{ position: "absolute", top: 6, right: -2, fontSize: 10, color: COLORS.rose, animation: "noteFloat3 3s ease-out infinite", animationDelay: "1.5s" }}>♪</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="tam-controls">
              <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className={`tam-play ${!isPlaying ? "tam-play-pulse" : ""}`}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: COLORS.midnight }}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: COLORS.midnight }}><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button onClick={nextTrack} aria-label="Next track" className="tam-next">
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: COLORS.moon }}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            {/* Track info */}
            <div className="tam-info">
              <div className="tam-track">{trackName}</div>
              <div className="tam-radio">3 AM radio</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="tam-progress" role="progressbar" aria-valuenow={Math.round(cur)} aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-label="Track progress">
            <span>{fmt(cur)}</span>
            <div className="tam-bar">
              <div className="tam-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span>{fmt(dur)}</span>
          </div>
        </div>

        {/* Timeout fallback */}
        {apiTimedOut && !isReady && (
          <div style={{ fontSize: 11, color: COLORS.moon, opacity: 0.7, textAlign: "center", marginBottom: 12 }}>
            Playback didn&apos;t load.{" "}
            <a href={YT_MUSIC_URL} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.amber }}>Open on YouTube</a>
          </div>
        )}

        {/* Footer */}
        <div className="tam-footer">
          <span style={{ color: COLORS.amber, fontWeight: 500 }}>{listenerCount !== null ? listenerCount : "—"}</span>{" "}
          people awake with you right now
        </div>
      </div>

      {/* Hidden YT player — sized 200x200 for Android compatibility but visually hidden */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 200, height: 200, overflow: "hidden", opacity: 0.01, pointerEvents: "none", zIndex: -1 }}>
        <div id="yt-audio-target" />
      </div>
    </div>
  );
}
