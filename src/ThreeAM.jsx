import { useState, useRef } from "react";
import sceneImage from "./assets/scene.jpg";
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
// YouTube playlist ID (required for playback)
const YT_PLAYLIST_ID = "PL9bw4S5ePsEG1BSA7I5EtqskLWRaQojwR";

// Supabase credentials for real-time listener count (optional)
// Replace with your project values to enable the "X online" counter
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

// Streaming platform links
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
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `radial-gradient(120% 90% at 50% 0%, ${COLORS.violet} 0%, ${COLORS.midnight} 55%, #060814 100%)`,
        color: COLORS.paper,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
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

      {/* Decorative stars */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
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

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 600,
          margin: "0 auto",
          padding: "12px 20px 12px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.04em",
            color: COLORS.moon,
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="dot"
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: COLORS.amber,
                boxShadow: `0 0 8px ${COLORS.amber}`,
                animation: "pulseDot 2.2s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <span>
              {listenerCount !== null ? `${listenerCount} online` : "— online"}
            </span>
          </div>
          <nav
            aria-label="Streaming platforms"
            style={{ display: "flex", gap: 12, alignItems: "center" }}
          >
            {SPOTIFY_URL && (
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen on Spotify"
                title="Listen on Spotify"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(201,205,224,0.08)",
                  opacity: 0.8,
                  transition: "opacity .2s, background .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 1;
                  e.currentTarget.style.background = "rgba(30,215,96,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = 0.8;
                  e.currentTarget.style.background = "rgba(201,205,224,0.08)";
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#1ED760">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.72-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
            )}
            {YT_MUSIC_URL && (
              <a
                href={YT_MUSIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen on YouTube Music"
                title="Listen on YouTube Music"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(201,205,224,0.08)",
                  opacity: 0.8,
                  transition: "opacity .2s, background .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 1;
                  e.currentTarget.style.background = "rgba(255,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = 0.8;
                  e.currentTarget.style.background = "rgba(201,205,224,0.08)";
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF0000">
                  <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104A7.1 7.1 0 1 1 19.104 12 7.109 7.109 0 0 1 12 19.104zm0-13.332A6.228 6.228 0 1 0 18.228 12 6.234 6.234 0 0 0 12 5.772zM9.684 15.84V8.16L16.2 12z" />
                </svg>
              </a>
            )}
          </nav>
        </header>

        {/* Scene */}
        <div
          role="img"
          aria-label="Atmospheric night scene with rain and moonlight"
          style={{
            position: "relative",
            flex: 1,
            margin: "10px 0 10px",
            borderRadius: 18,
            overflow: "hidden",
            minHeight: 0,
            boxShadow:
              "0 30px 80px -30px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.05)",
          }}
        >
          {/* Photo with Ken Burns drift */}
          <div
            className="kenburns"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-4%",
              backgroundImage: `url(${SCENE_IMAGE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: "kenburns 22s ease-in-out infinite",
              willChange: "transform",
            }}
          />

          {/* Pulsing moon glow */}
          <div
            className="moonglow"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "10%",
              top: "3%",
              width: "26%",
              height: "26%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(244,239,224,0.9) 0%, rgba(232,217,176,0.35) 45%, rgba(232,217,176,0) 75%)",
              mixBlendMode: "screen",
              animation: "moonPulse 6s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Color wash overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(120% 90% at 22% 8%, rgba(74,66,112,0.18) 0%, rgba(11,16,38,0.35) 60%, rgba(6,8,20,0.55) 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* Rain overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              mixBlendMode: "screen",
              opacity: 0.55,
            }}
          >
            {drops.map((d, i) => (
              <div
                key={i}
                className="drop"
                style={{
                  position: "absolute",
                  left: `${d.left}%`,
                  width: 1,
                  height: 34,
                  background: `linear-gradient(to bottom, rgba(201,205,224,0), rgba(201,205,224,.6))`,
                  animation: `fall ${d.dur}s linear infinite`,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              left: 16,
              bottom: 14,
              zIndex: 3,
              fontFamily: "'Cormorant', serif",
              fontStyle: "italic",
              fontSize: 17,
              color: COLORS.paper,
              opacity: 0.9,
              textShadow: "0 2px 10px rgba(0,0,0,.6)",
              maxWidth: "80%",
            }}
          >
            the songs you play when no one can hear you
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1
            style={{
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "clamp(32px, 9vw, 48px)",
              lineHeight: 0.95,
              color: COLORS.paper,
              textShadow: "0 0 30px rgba(232,166,87,.15)",
              letterSpacing: "0.01em",
              margin: 0,
            }}
          >
            3 AM
          </h1>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: COLORS.rose,
              opacity: 0.85,
            }}
          >
            still awake · still listening
          </div>
        </div>

        {/* Player controls */}
        <div
          role="region"
          aria-label="Music player"
          style={{
            background: "rgba(11,16,38,.55)",
            border: "1px solid rgba(201,205,224,.14)",
            backdropFilter: "blur(14px)",
            borderRadius: 16,
            padding: "12px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Spinning album art with floating notes */}
            <div style={{ position: "relative", flex: "none" }}>
              <div
                className="disc-spin"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid rgba(201,205,224,0.2)`,
                  boxShadow: "0 4px 16px -4px rgba(0,0,0,.5)",
                  animation: isPlaying
                    ? "spinDisc 8s linear infinite"
                    : "none",
                  background: COLORS.midnight,
                }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: COLORS.violet,
                        border: `2px solid ${COLORS.moon}`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Floating music notes that pop out and vanish */}
              {isPlaying && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <span
                    className="note-float"
                    style={{
                      position: "absolute",
                      top: 4,
                      right: -4,
                      fontSize: 14,
                      color: COLORS.amber,
                      animation: "noteFloat 2s ease-out infinite",
                    }}
                  >
                    ♪
                  </span>
                  <span
                    className="note-float"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 2,
                      fontSize: 12,
                      color: COLORS.moon,
                      animation: "noteFloat2 2.5s ease-out infinite",
                      animationDelay: "0.8s",
                    }}
                  >
                    ♫
                  </span>
                  <span
                    className="note-float"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 2,
                      fontSize: 11,
                      color: COLORS.rose,
                      animation: "noteFloat3 3s ease-out infinite",
                      animationDelay: "1.5s",
                    }}
                  >
                    ♪
                  </span>
                </div>
              )}
            </div>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              style={{
                flex: "none",
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: `linear-gradient(160deg, ${COLORS.amber}, ${COLORS.rose})`,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px -8px rgba(232,166,87,.6)",
              }}
            >
              {isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ width: 16, height: 16, fill: COLORS.midnight }}
                >
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ width: 16, height: 16, fill: COLORS.midnight }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next track button */}
            <button
              onClick={nextTrack}
              aria-label="Next track"
              style={{
                flex: "none",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(201,205,224,0.08)",
                border: "1px solid rgba(201,205,224,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(201,205,224,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(201,205,224,0.08)";
              }}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ width: 14, height: 14, fill: COLORS.moon }}
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: COLORS.paper,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {trackName}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: COLORS.moon,
                  opacity: 0.6,
                  marginTop: 2,
                }}
              >
                3 AM radio
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={Math.round(cur)}
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-label="Track progress"
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: COLORS.moon,
              opacity: 0.75,
            }}
          >
            <span aria-hidden="true">{fmt(cur)}</span>
            <div
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: "rgba(201,205,224,.18)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${COLORS.rose}, ${COLORS.amber})`,
                  borderRadius: 2,
                }}
              />
            </div>
            <span aria-hidden="true">{fmt(dur)}</span>
          </div>
        </div>

        {/* Fallback message when API times out */}
        {apiTimedOut && !isReady && (
          <div
            role="alert"
            style={{
              marginTop: 10,
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              color: COLORS.moon,
              opacity: 0.75,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Playback didn&apos;t load here — this can happen in sandboxed
            previews.{" "}
            <a
              href={YT_MUSIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.amber }}
            >
              Open the playlist on YouTube
            </a>{" "}
            instead, or try this page once it&apos;s hosted on its own.
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: COLORS.moon,
            opacity: 0.75,
          }}
        >
          <span>
            <span style={{ color: COLORS.amber, fontWeight: 500 }}>
              {listenerCount !== null ? listenerCount : "—"}
            </span>{" "}
            people awake with you right now
          </span>
        </footer>
      </div>

      {/* Hidden YouTube player target */}
      <div
        id="yt-audio-target"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
