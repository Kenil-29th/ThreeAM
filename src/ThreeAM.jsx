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

// ---- Configuration ----
const YT_PLAYLIST_ID = "PL9bw4S5ePsEG1BSA7I5EtqskLWRaQojwR";
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const SPOTIFY_URL = "";
const YT_MUSIC_URL =
  "https://music.youtube.com/playlist?list=PL9bw4S5ePsEG1BSA7I5EtqskLWRaQojwR";
// -----------------------

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
    Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 55,
      delay: Math.random() * 4,
    }))
  );

  const [drops] = useState(() =>
    Array.from({ length: 26 }, () => ({
      left: Math.random() * 100,
      dur: 0.7 + Math.random() * 0.8,
      delay: Math.random() * 1.5,
    }))
  );

  return (
    <div
      ref={containerRef}
      className="three-am-root"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .three-am-root {
          min-height: 100dvh;
          width: 100%;
          background: ${COLORS.midnight};
          color: ${COLORS.paper};
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .three-am-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          margin: 0 auto;
          padding: 12px 16px;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          justify-content: flex-end;
        }

        .scene-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .title-section h1 {
          font-family: 'Cormorant', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(28px, 8vw, 48px);
          line-height: 0.95;
          color: ${COLORS.paper};
          text-shadow: 0 0 30px rgba(232,166,87,.15);
          letter-spacing: 0.01em;
          margin: 0;
        }

        .title-section .subtitle {
          margin-top: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${COLORS.rose};
          opacity: 0.85;
        }

        .player-card {
          background: rgba(11,16,38,.82);
          border: 1px solid rgba(201,205,224,.14);
          border-radius: 14px;
          padding: 12px 14px;
        }

        .player-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .disc-wrapper {
          position: relative;
          flex: none;
        }

        .disc {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(201,205,224,0.2);
          box-shadow: 0 4px 16px -4px rgba(0,0,0,.5);
          background: ${COLORS.midnight};
        }

        .disc.playing {
          animation: spinDisc 8s linear infinite;
        }

        .play-btn {
          flex: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(160deg, ${COLORS.amber}, ${COLORS.rose});
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px -6px rgba(232,166,87,.6);
        }

        .next-btn {
          flex: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(201,205,224,0.08);
          border: 1px solid rgba(201,205,224,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s;
        }
        .next-btn:hover { background: rgba(201,205,224,0.16); }

        .track-info {
          flex: 1;
          min-width: 0;
        }
        .track-name {
          font-size: 13px;
          font-weight: 500;
          color: ${COLORS.paper};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .track-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.6;
          margin-top: 2px;
        }

        .progress-row {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.75;
        }

        .progress-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: rgba(201,205,224,.18);
          position: relative;
          overflow: hidden;
        }
        .progress-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: linear-gradient(90deg, ${COLORS.rose}, ${COLORS.amber});
          border-radius: 2px;
        }

        .footer-text {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: ${COLORS.moon};
          opacity: 0.75;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .three-am-content {
            padding: 10px 12px;
          }
          .title-section h1 {
            font-size: clamp(24px, 10vw, 36px);
          }
          .title-section .subtitle {
            font-size: 9px;
          }
          .player-card {
            padding: 10px 12px;
            border-radius: 12px;
          }
          .player-row {
            gap: 8px;
          }
          .disc {
            width: 40px;
            height: 40px;
          }
          .play-btn {
            width: 36px;
            height: 36px;
          }
          .next-btn {
            width: 28px;
            height: 28px;
          }
          .track-name {
            font-size: 12px;
          }
          .track-sub {
            font-size: 9px;
          }
          .progress-row {
            margin-top: 8px;
            font-size: 9px;
          }
          .footer-text {
            font-size: 9px;
            margin-top: 6px;
          }
        }

        /* Very small screens (iPhone SE, etc) */
        @media (max-height: 600px) {
          .three-am-content {
            padding: 6px 10px;
          }
          .title-section {
            margin-bottom: 4px !important;
          }
          .title-section h1 {
            font-size: 22px;
          }
          .player-card {
            padding: 8px 10px;
          }
          .disc {
            width: 34px;
            height: 34px;
          }
          .play-btn {
            width: 32px;
            height: 32px;
          }
          .next-btn {
            width: 26px;
            height: 26px;
          }
        }

        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.8} }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
        @keyframes fall { 0%{transform:translateY(-40px)} 100%{transform:translateY(320px)} }
        @keyframes kenburns {
          0%   { transform: scale(1) translate(0px, 0px); }
          50%  { transform: scale(1.07) translate(-1.2%, -0.6%); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        @keyframes moonPulse {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50%     { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes spinDisc {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes noteFloat {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          50%  { opacity: 0.8; transform: translate(12px, -18px) scale(1.2); }
          100% { opacity: 0; transform: translate(24px, -36px) scale(0.6); }
        }
        @keyframes noteFloat2 {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          50%  { opacity: 0.7; transform: translate(-10px, -22px) scale(1.1); }
          100% { opacity: 0; transform: translate(-18px, -40px) scale(0.5); }
        }
        @keyframes noteFloat3 {
          0%   { opacity: 1; transform: translate(0, 0) scale(0.9); }
          50%  { opacity: 0.6; transform: translate(8px, -26px) scale(1.15); }
          100% { opacity: 0; transform: translate(4px, -44px) scale(0.4); }
        }
        @media (prefers-reduced-motion: reduce) {
          .star, .dot, .drop, .kenburns, .moonglow, .disc-spin, .note-float { animation: none !important; }
        }
      `}</style>

      {/* Stars */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: COLORS.moon,
              opacity: 0.5,
              animation: `twinkle 4s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Full-screen scene background */}
      <div className="scene-container" role="img" aria-label="Atmospheric night scene with rain and moonlight">
        <div className="kenburns" aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `url(${SCENE_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center", animation: "kenburns 22s ease-in-out infinite", willChange: "transform" }} />
        <div className="moonglow" aria-hidden="true" style={{ position: "absolute", left: "10%", top: "3%", width: "26%", height: "26%", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,239,224,0.9) 0%, rgba(232,217,176,0.35) 45%, rgba(232,217,176,0) 75%)", mixBlendMode: "screen", animation: "moonPulse 6s ease-in-out infinite", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,16,38,0) 30%, rgba(11,16,38,0.6) 65%, rgba(6,8,20,0.92) 100%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", opacity: 0.45 }}>
          {drops.map((d, i) => (
            <div key={i} className="drop" style={{ position: "absolute", left: `${d.left}%`, width: 1, height: 34, background: `linear-gradient(to bottom, rgba(201,205,224,0), rgba(201,205,224,.6))`, animation: `fall ${d.dur}s linear infinite`, animationDelay: `${d.delay}s` }} />
          ))}
        </div>
      </div>

      <div className="three-am-content">
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.04em", color: COLORS.moon, opacity: 0.85, marginBottom: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="dot" aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.amber, boxShadow: `0 0 8px ${COLORS.amber}`, animation: "pulseDot 2.2s ease-in-out infinite", display: "inline-block" }} />
            <span>{listenerCount !== null ? `${listenerCount} online` : "— online"}</span>
          </div>
          <nav aria-label="Streaming platforms" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {SPOTIFY_URL && (
              <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" aria-label="Listen on Spotify" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "rgba(201,205,224,0.08)", opacity: 0.8 }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#1ED760"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.72-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              </a>
            )}
            {YT_MUSIC_URL && (
              <a href={YT_MUSIC_URL} target="_blank" rel="noopener noreferrer" aria-label="Listen on YouTube Music" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "rgba(201,205,224,0.08)", opacity: 0.8 }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF0000"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104A7.1 7.1 0 1 1 19.104 12 7.109 7.109 0 0 1 12 19.104zm0-13.332A6.228 6.228 0 1 0 18.228 12 6.234 6.234 0 0 0 12 5.772zM9.684 15.84V8.16L16.2 12z" /></svg>
              </a>
            )}
          </nav>
        </header>

        {/* Tagline */}
        <div style={{ fontFamily: "'Cormorant', serif", fontStyle: "italic", fontSize: "clamp(14px, 3.5vw, 18px)", color: COLORS.paper, opacity: 0.9, textShadow: "0 2px 10px rgba(0,0,0,.6)", marginBottom: 12 }}>
          the songs you play when no one can hear you
        </div>

        {/* Title */}
        <div className="title-section" style={{ textAlign: "center", marginBottom: 12 }}>
          <h1>3 AM</h1>
          <div className="subtitle">still awake · still listening</div>
        </div>

        {/* Player */}
        <div className="player-card" role="region" aria-label="Music player">
          <div className="player-row">
            {/* Spinning disc */}
            <div className="disc-wrapper">
              <div className={`disc ${isPlaying ? "playing" : ""}`}>
                {thumbnail ? (
                  <img src={thumbnail} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.violet, border: `2px solid ${COLORS.moon}` }} />
                  </div>
                )}
              </div>
              {isPlaying && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <span className="note-float" style={{ position: "absolute", top: 2, right: -4, fontSize: 12, color: COLORS.amber, animation: "noteFloat 2s ease-out infinite" }}>♪</span>
                  <span className="note-float" style={{ position: "absolute", top: -2, left: 0, fontSize: 10, color: COLORS.moon, animation: "noteFloat2 2.5s ease-out infinite", animationDelay: "0.8s" }}>♫</span>
                  <span className="note-float" style={{ position: "absolute", top: 6, right: 0, fontSize: 9, color: COLORS.rose, animation: "noteFloat3 3s ease-out infinite", animationDelay: "1.5s" }}>♪</span>
                </div>
              )}
            </div>

            {/* Play/Pause */}
            <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="play-btn">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 14, height: 14, fill: COLORS.midnight }}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 14, height: 14, fill: COLORS.midnight }}><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Next */}
            <button onClick={nextTrack} aria-label="Next track" className="next-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 12, height: 12, fill: COLORS.moon }}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>

            {/* Track info */}
            <div className="track-info">
              <div className="track-name">{trackName}</div>
              <div className="track-sub">3 AM radio</div>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-row" role="progressbar" aria-valuenow={Math.round(cur)} aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-label="Track progress">
            <span aria-hidden="true">{fmt(cur)}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span aria-hidden="true">{fmt(dur)}</span>
          </div>
        </div>

        {/* Timeout fallback */}
        {apiTimedOut && !isReady && (
          <div role="alert" style={{ marginTop: 8, fontSize: 11, color: COLORS.moon, opacity: 0.75, textAlign: "center", lineHeight: 1.4 }}>
            Playback didn&apos;t load here.{" "}
            <a href={YT_MUSIC_URL} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.amber }}>Open on YouTube</a> instead.
          </div>
        )}

        {/* Footer */}
        <footer className="footer-text">
          <span>
            <span style={{ color: COLORS.amber, fontWeight: 500 }}>{listenerCount !== null ? listenerCount : "—"}</span>{" "}
            people awake with you right now
          </span>
        </footer>
      </div>

      {/* Hidden YT player */}
      <div id="yt-audio-target" aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}
