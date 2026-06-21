"use client";
import { useEffect, useRef, useState } from "react";
import { saveGameScore, getLeaderboard } from "@/app/actions/game";

type Coin = { id: number; x: number; y: number; emoji: string; value: number };
const KINDS = [
  { emoji: "🪙", value: 1, w: 70 },
  { emoji: "💰", value: 3, w: 22 },
  { emoji: "💎", value: 5, w: 8 },
];
function pick() { const r = Math.random() * 100; let a = 0; for (const k of KINDS) { a += k.w; if (r <= a) return k; } return KINDS[0]; }

export default function CoinGame() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"intro" | "play" | "done">("intro");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const idRef = useRef(0);
  const timers = useRef<any[]>([]);

  function clearTimers() { timers.current.forEach(clearInterval); timers.current.forEach(clearTimeout); timers.current = []; }
  useEffect(() => () => clearTimers(), []);

  function start() {
    setScore(0); setTime(30); setCoins([]); setSaved(false); setView("play");
    const spawn = setInterval(() => {
      const k = pick();
      const c: Coin = { id: ++idRef.current, x: 6 + Math.random() * 84, y: 12 + Math.random() * 74, emoji: k.emoji, value: k.value };
      setCoins(p => [...p, c]);
      const to = setTimeout(() => setCoins(p => p.filter(x => x.id !== c.id)), 1150);
      timers.current.push(to);
    }, 520);
    const tick = setInterval(() => setTime(t => {
      if (t <= 1) { clearTimers(); setCoins([]); finish(); return 0; }
      return t - 1;
    }), 1000);
    timers.current.push(spawn, tick);
  }

  async function finish() {
    setView("done");
    setScore(s => { void save(s); return s; });
  }
  async function save(s: number) {
    try { await saveGameScore(s); setSaved(true); } catch {}
    try { setBoard(await getLeaderboard()); } catch {}
  }
  function hit(c: Coin) { setScore(s => s + c.value); setCoins(p => p.filter(x => x.id !== c.id)); }
  function close() { clearTimers(); setOpen(false); setView("intro"); setCoins([]); }

  return (
    <>
      <button onClick={() => setOpen(true)} title="psst… klik mij 🤫" aria-label="Mini-spel"
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 60, width: 44, height: 44, borderRadius: "50%",
          border: "1px solid var(--line)", background: "var(--panel)", cursor: "pointer", fontSize: 20, opacity: .45,
          transition: "opacity .2s, transform .2s", boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.1) rotate(8deg)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = ".45"; e.currentTarget.style.transform = "none"; }}>
        🪙
      </button>

      {open && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center", padding: 16, animation: "fadeInUp .25s both" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "linear-gradient(180deg,#161b14,#0e120c)", border: "1px solid var(--greend)", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
              <b className="display" style={{ fontSize: 18, color: "var(--gold)" }}>💰 Cash Grab</b>
              <button className="btn ghost sm" onClick={close}>✕</button>
            </div>

            {view === "intro" && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 44 }}>🪙💰💎</div>
                <h3 style={{ margin: "10px 0 6px" }}>Klik zoveel mogelijk munten!</h3>
                <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>30 seconden. 🪙 = 1 · 💰 = 3 · 💎 = 5. Snel zijn, ze verdwijnen!</p>
                <button className="btn" style={{ marginTop: 8 }} onClick={start}>Start</button>
              </div>
            )}

            {view === "play" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", fontWeight: 700 }}>
                  <span>Score: <span className="gold">{score}</span></span>
                  <span>⏱️ <span style={{ color: time <= 5 ? "var(--red)" : "var(--cream)" }}>{time}s</span></span>
                </div>
                <div style={{ position: "relative", height: 340, margin: "0 14px 14px", borderRadius: 12, overflow: "hidden",
                  background: "radial-gradient(circle at 50% 30%, rgba(70,224,85,.08), transparent), #0c100b", border: "1px solid var(--line)" }}>
                  {coins.map(c => (
                    <button key={c.id} onClick={() => hit(c)} style={{ position: "absolute", left: c.x + "%", top: c.y + "%",
                      transform: "translate(-50%,-50%)", border: 0, background: "transparent", cursor: "pointer", fontSize: 32, padding: 0,
                      animation: "popIn .12s both", filter: "drop-shadow(0 3px 4px rgba(0,0,0,.5))" }}>{c.emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {view === "done" && (
              <div style={{ padding: 22 }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 40 }}>🏆</div>
                  <h3 style={{ margin: "6px 0" }}>Tijd om! Je scoorde <span className="gold">{score}</span></h3>
                  <p className="muted" style={{ fontSize: 12, margin: 0 }}>{saved ? "Score opgeslagen in de ranglijst." : "Score opslaan…"}</p>
                </div>
                <h4 style={{ color: "var(--gold)", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>🥇 Top 10</h4>
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {board.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8,
                      background: i === 0 ? "rgba(240,196,60,.12)" : i % 2 ? "transparent" : "rgba(255,255,255,.02)" }}>
                      <span>{["🥇", "🥈", "🥉"][i] || `#${i + 1}`} {b.naam}</span><b className="gold">{b.score}</b>
                    </div>
                  ))}
                  {board.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Nog geen scores.</p>}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="btn" style={{ flex: 1 }} onClick={start}>Opnieuw</button>
                  <button className="btn ghost" onClick={close}>Sluiten</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
