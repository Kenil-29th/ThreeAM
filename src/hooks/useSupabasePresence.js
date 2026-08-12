import { useEffect, useState } from "react";

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

export default function useSupabasePresence(supabaseUrl, supabaseAnonKey) {
  const [listenerCount, setListenerCount] = useState(null);

  const isConfigured =
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes("YOUR_") &&
    !supabaseAnonKey.includes("YOUR_");

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    let channel;

    loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js",
      () => !!window.supabase
    ).then(() => {
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      const roomId = Math.random().toString(36).slice(2);
      channel = client.channel("3am-room", {
        config: { presence: { key: roomId } },
      });
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          setListenerCount(Object.keys(state).length);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ joined_at: new Date().toISOString() });
          }
        });
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [isConfigured, supabaseUrl, supabaseAnonKey]);

  return listenerCount;
}
