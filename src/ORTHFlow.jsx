import { useEffect, useRef, useState } from "react";
import {
  Menu, Bell, Cloud, NavArrowRight, NavArrowLeft, NavArrowDown, Plus,
  Attachment, Microphone, EditPencil, ArrowUpRight, Check, Xmark, Expand,
  Eye, Droplet, WateringSoil, Label, LabelSolid,
} from "iconoir-react";

/* ===================== tokens ===================== */
const ink = "#0c0f13", ink900 = "#141719", inkUp = "#1e2226", ink700 = "#2e3337",
  ink600 = "#404549", ink500 = "#585d62", ink400 = "#757a7f", ink300 = "#979b9f",
  ink200 = "#bcbfc3", ink100 = "#dcdfe2", ink50 = "#f0f2f4";
const black = "#000000", white = "#ffffff";
const text = ink50, sec = ink400, ter = ink600;
const hyper = "#7733aa";
const BOTTOM_GRAD = "linear-gradient(0deg, rgba(12,15,19,0.9) 0%, rgba(12,15,19,0.888) 8.1%, rgba(12,15,19,0.856) 15.5%, rgba(12,15,19,0.806) 22.5%, rgba(12,15,19,0.743) 29%, rgba(12,15,19,0.667) 35.3%, rgba(12,15,19,0.583) 41.2%, rgba(12,15,19,0.495) 47.1%, rgba(12,15,19,0.405) 52.9%, rgba(12,15,19,0.317) 58.8%, rgba(12,15,19,0.233) 64.7%, rgba(12,15,19,0.158) 70.1%, rgba(12,15,19,0.094) 76.5%, rgba(12,15,19,0.044) 84.5%, rgba(12,15,19,0.012) 91.9%, rgba(12,15,19,0) 100%)";
// smooth eased fade from the image into the dark sheet (top → bottom)
const HEADER_GRAD = "linear-gradient(180deg, rgba(12,15,19,0) 0%, rgba(12,15,19,0.3) 20%, rgba(12,15,19,0.5) 40%, rgba(12,15,19,0.7) 60%, rgba(12,15,19,0.9) 80%, rgba(12,15,19,1) 100%)";
const BR = { blue: "#3D8EF0", green: "#00cd61", gold: "#efb768", red: "#f32b44" };
const STATUS = {
  Scheduled: { bg: BR.blue, fg: ink50 },
  Overdue: { bg: BR.red, fg: white },
  Done: { bg: BR.green, fg: white },
};

/* ===================== icons (Iconoir) ===================== */
const I = {
  menu: Menu, bell: Bell, cloud: Cloud,
  chevR: NavArrowRight, chevL: NavArrowLeft, chevD: NavArrowDown,
  plus: Plus, attachment: Attachment, mic: Microphone, edit: EditPencil,
  arrowUpRight: ArrowUpRight, check: Check, x: Xmark, expand: Expand,
  eye: Eye, droplet: Droplet, spray: WateringSoil, label: Label, labelSolid: LabelSolid,
};
function Ico({ paths: Glyph, size = 22, color = "currentColor" }) {
  return <Glyph width={size} height={size} color={color} />;
}
const CAT_ICON = { Monitoring: "eye", Spray: "spray", Irrigation: "droplet" };
const actionIcon = cat => I[CAT_ICON[cat] || "eye"];
const ACTIONS = [
  { title: "Check drip line pressure\n+ emitter flow", plot: "Plot M", status: "Scheduled", due: "Thu 4 Jun", cat: "Monitoring", note: "Threshold: 30 adults" },
  { title: "Scout for navel\norangeworm egg masses", plot: "Plot V", status: "Scheduled", due: "Fri 5 Jun", cat: "Monitoring", note: "Egg mass count per tree" },
  { title: "Apply dormant oil spray", plot: "Plot M", status: "Overdue", due: "Mon 1 Jun", cat: "Spray", note: "Cover before bud swell" },
  { title: "Soil moisture reading\nbefore irrigation", plot: "Plot V", status: "Scheduled", due: "Sat 6 Jun", cat: "Irrigation", note: "Probe at 30cm" },
  { title: "Inspect for leaffooted\nbug activity", plot: "Plot M", status: "Done", due: "Tue 2 Jun", cat: "Monitoring", note: "Field margins first" },
];
const PLANS = [
  { title: "6-week IPM plan", cur: 2, total: 7, plot: "Plot M", img: "/engin-akyurt-FaIxbupQYXY-unsplash.jpg" },
  { title: "Irrigation schedule", cur: 3, total: 8, plot: "Plot V", img: "/planet-volumes-tbscCvjIHpA-unsplash.jpg" },
  { title: "Nutrient program", cur: 1, total: 6, plot: "Plot M", img: "/resource-database-XzwMPV8jhIY-unsplash.jpg" },
  { title: "Hull split spray plan", cur: 0, total: 5, plot: "Plot V", img: "/pexels-pit0chka-9123925.jpg" },
  { title: "Pest control", cur: 4, total: 9, plot: "Plot M", img: "/joshua-earle-Z3yQAP8S_lQ-unsplash.jpg" },
];
const PLOTS = [
  { name: "Plot M", sub: "Northwest", size: "9.58 ha", crop: "Carmel Almonds", locked: true, progress: 88, shape: "14,22 56,14 91,55 64,93 20,78 9,46" },
  { name: "Plot V", sub: "South", size: "9.58 ha", crop: "Carmel Almonds", locked: false, progress: 100, shape: "33,14 67,14 73,86 27,86", rot: 45 },
  { name: "Plot Z", sub: "East", size: "6.12 ha", crop: "Nonpareil Almonds", locked: true, progress: 42, shape: "12,34 88,29 88,71 12,66", rot: -45 },
  { name: "Plot N", sub: "Riverside", size: "4.30 ha", crop: "Butte Almonds", locked: true, progress: 18, shape: "18,14 79,11 72,44 71,90 26,84 10,52" },
];
// plots positioned on the map (px in a 402x874 frame); shapes reuse the real PLOTS geometry
const MAP_PLOTS = [
  { name: "Plot M", count: 2, cx: 215, cy: 168, size: 150 },
  { name: "Plot V", count: 1, cx: 272, cy: 330, size: 150 },
  { name: "Plot N", count: 1, cx: 112, cy: 470, size: 140 },
];

/* ===================== shared bits ===================== */
function PlotGlyph({ shape, rot, size = 15, dots = false, sw = 1.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {dots && [15, 38, 62, 85].map(y => [15, 38, 62, 85].map(x => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={ink700} />
      )))}
      <polygon points={shape} fill="none" stroke={white} strokeWidth={sw} vectorEffect="non-scaling-stroke"
        strokeLinejoin="miter" transform={rot ? `rotate(${rot} 50 50)` : undefined} />
    </svg>
  );
}
function Frame({ children }) {
  return (
    <div className="orth-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: black, padding: "24px 0", fontFamily: "'Nunito Sans', -apple-system, sans-serif" }}>
      <div className="orth-frame" style={{ width: 402, height: 874, position: "relative", overflow: "hidden", background: ink, borderRadius: 55 }}>
        {children}
      </div>
    </div>
  );
}
const circleBtn = { width: 40, height: 40, borderRadius: "50%", background: black, display: "flex", alignItems: "center", justifyContent: "center" };

/* ===================== iOS interaction primitives ===================== */
const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";   // iOS sheet-present curve

// Web haptics: navigator.vibrate (Android) + the iOS 17.4+ <input switch> tap.
function ensureHaptic() {
  if (typeof document === "undefined" || window.__orthHaptic) return;
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);
  document.body.appendChild(label);
  window.__orthHaptic = label;
}
function haptic(ms = 7) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  try { ensureHaptic(); window.__orthHaptic && window.__orthHaptic.click(); } catch (e) {}
}

// Press feedback: scales + dims under the finger, springs back. Fires a haptic on tap.
function Pressable({ onClick, scale = 0.965, disabled, style, children, stop, noHaptic, ...rest }) {
  const [down, setDown] = useState(false);
  if (disabled) return <div style={style} {...rest}>{children}</div>;
  return (
    <div
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={e => { if (stop) e.stopPropagation(); if (!noHaptic) haptic(); onClick && onClick(e); }}
      style={{ ...style, transform: `${style && style.transform ? style.transform + " " : ""}scale(${down ? scale : 1})`, opacity: down ? 0.88 : 1, transition: `transform .22s ${SPRING}, opacity .22s ${SPRING}`, WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Bottom sheet: springs up on mount, down on exit, drag-the-handle to dismiss.
function Sheet({ top = 128, background = ink, radius = 30, zIndex = 20, show = true, onExited, onDismiss, grabber = "solid", children }) {
  const drag = useRef({ active: false, startY: 0, dy: 0, t0: 0, pid: null });
  const [t, setT] = useState("translateY(100%)");
  const [spring, setSpring] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => { setSpring(true); setT("translateY(0px)"); });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => { if (!show) { setSpring(true); setT("translateY(100%)"); } }, [show]);

  const onEnd = e => { if (e.target === e.currentTarget && e.propertyName === "transform" && !show) onExited && onExited(); };

  const start = e => {
    drag.current = { active: true, startY: e.clientY, dy: 0, t0: Date.now(), pid: e.pointerId };
    setSpring(false);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {}
  };
  const move = e => {
    if (!drag.current.active) return;
    const dy = Math.max(0, e.clientY - drag.current.startY);
    drag.current.dy = dy;
    setT(`translateY(${dy}px)`);
  };
  const end = () => {
    if (!drag.current.active) return;
    const { dy, t0 } = drag.current;
    const v = dy / Math.max(Date.now() - t0, 1);
    drag.current.active = false;
    setSpring(true);
    if (dy > 110 || v > 0.55) { haptic(12); onDismiss && onDismiss(); }
    else setT("translateY(0px)");
  };

  const grabEl = (
    <div onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: 30, zIndex: 9, display: "flex", justifyContent: "center", paddingTop: 12, cursor: "grab", touchAction: "none" }}>
      <div style={{ width: 38, height: 5, borderRadius: 3, background: grabber === "light" ? ink400 : ink700 }} />
    </div>
  );

  return (
    <div onTransitionEnd={onEnd}
      style={{ position: "absolute", top, left: 0, right: 0, bottom: 0, zIndex, background, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: "hidden", display: "flex", flexDirection: "column", transform: t, transition: spring ? `transform .44s ${SPRING}` : "none", willChange: "transform" }}>
      {grabEl}
      {children}
    </div>
  );
}
function TopNav() {
  return (
    <div style={{ position: "absolute", top: 58, left: 0, right: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
      <Pressable style={circleBtn}><Ico paths={I.menu} size={20} color={ink50} /></Pressable>
      <Pressable style={{ background: black, borderRadius: 22, padding: "9px 11px 9px 15px", display: "flex", alignItems: "center", gap: 6 }}>
        <Ico paths={I.cloud} size={16} color={ink200} />
        <span style={{ color: ink50, fontSize: 14, fontWeight: 600 }}>31.2°C</span>
        <Ico paths={I.chevR} size={13} color={ink400} />
      </Pressable>
      <div style={{ position: "relative" }}>
        <Pressable style={circleBtn}><Ico paths={I.bell} size={20} color={ink50} /></Pressable>
        <div style={{ position: "absolute", top: -2, right: -2, background: BR.red, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: white, fontSize: 10, fontWeight: 600 }}>2</span>
        </div>
      </div>
    </div>
  );
}
function InputBar({ ph, bg = black }) {
  return (
    <Pressable scale={0.99} style={{ background: bg, borderRadius: 999, display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", cursor: "text" }}>
      <Ico paths={I.attachment} size={21} color={sec} />
      <span style={{ flex: 1, color: sec, fontSize: 17 }}>{ph}</span>
      <Ico paths={I.mic} size={21} color={sec} />
    </Pressable>
  );
}
function Dots({ cur, total, onWhite }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: i < cur ? 16 : 8, height: 7, borderRadius: 4, background: i < cur ? BR.green : (onWhite ? ink100 : ink700) }} />
      ))}
    </div>
  );
}
function StatusPill({ status, big }) {
  const st = STATUS[status];
  return <span style={{ background: st.bg, color: st.fg, fontSize: big ? 13 : 11.5, fontWeight: 600, padding: big ? "7px 14px" : "5px 11px", borderRadius: 20 }}>{status}</span>;
}
function PlotPill({ name, big }) {
  const ps = PLOTS.find(x => x.name === name);
  return (
    <div style={{ background: black, borderRadius: 20, padding: big ? "9px 15px" : "6px 12px", display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ color: white, fontSize: big ? 15 : 13, fontWeight: 500 }}>{name}</span>
      {ps && <PlotGlyph shape={ps.shape} rot={ps.rot} size={big ? 17 : 15} />}
    </div>
  );
}

/* ===================== onboarding (kept, not routed) ===================== */
const STEPS = [
  { key: "farmName", kind: "text", title: "Name your farm", ph: "e.g. Valin Farm" },
  { key: "location", kind: "text", title: "Where is it?", ph: "Search a place" },
  { key: "concern", kind: "single", title: "Your top concern", sub: "We tune your alerts around this.", options: ["Water stress", "Pests", "Disease", "Yield", "Soil health", "Frost"] },
  { key: "draw", kind: "draw", title: "Draw your first plot", sub: "Tap the map to place boundary points." },
  { key: "plotName", kind: "text", title: "Name this plot", ph: "e.g. Plot M" },
  { key: "crop", kind: "single", title: "What grows here?", options: ["Almonds", "Olives", "Potatoes", "Citrus", "Grapes", "Wheat"] },
  { key: "variety", kind: "single", title: "Which variety?", options: ["Carmel", "Nonpareil", "Butte", "Monterey"] },
  { key: "planting", kind: "date", title: "Planting date" },
  { key: "field", kind: "single", title: "Field type", options: ["Open field", "Covered"] },
  { key: "irrigation", kind: "single", title: "Irrigation system", options: ["Drip", "Sprinkler", "Flood", "Pivot", "None"] },
  { key: "soil", kind: "single", title: "Soil type", options: ["Sandy", "Loam", "Clay", "Silt", "Chalk", "Peat"] },
];
function OnbField({ value, onChange, ph }) {
  return (
    <div style={{ background: ink900, borderRadius: 16, padding: "20px 22px" }}>
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph}
        style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: text, fontSize: 18, fontFamily: "inherit" }} />
    </div>
  );
}
function Chips({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {options.map(o => {
        const on = value === o;
        return (
          <Pressable key={o} onClick={() => onChange(o)} style={{ background: on ? ink50 : ink900, color: on ? ink : ink200, borderRadius: 999, padding: "14px 20px", fontSize: 16, fontWeight: on ? 600 : 500, cursor: "pointer", userSelect: "none" }}>{o}</Pressable>
        );
      })}
    </div>
  );
}
function DrawPlot({ points, setPoints }) {
  const add = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPoints([...points, [Math.round(x), Math.round(y)]]);
  };
  const pts = points.map(p => p.join(",")).join(" ");
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", height: 340, background: "#141719" }}>
      <svg onClick={add} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "crosshair" }}>
        {points.length > 1 && <polyline points={pts} fill={points.length > 2 ? "rgba(255,255,255,0.12)" : "none"} stroke={white} strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
        {points.length > 2 && <line x1={points[points.length - 1][0]} y1={points[points.length - 1][1]} x2={points[0][0]} y2={points[0][1]} stroke={white} strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />}
        {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill={white} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {points.length > 0 && <div onClick={() => setPoints([])} style={{ position: "absolute", top: 14, right: 14, background: black, color: ink200, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Clear</div>}
    </div>
  );
}
function DatePick({ value, onChange }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div style={{ background: ink900, borderRadius: 20, padding: 20 }}>
      <p style={{ color: text, fontSize: 17, fontWeight: 600, marginBottom: 16 }}>June 2026</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} style={{ color: ter, fontSize: 12, textAlign: "center" }}>{d}</span>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => <span key={"p" + i} />)}
        {days.map(d => {
          const on = value === d;
          return <div key={d} onClick={() => onChange(d)} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontSize: 15, cursor: "pointer", userSelect: "none", background: on ? ink50 : "transparent", color: on ? ink : ink200, fontWeight: on ? 600 : 400 }}>{d}</div>;
        })}
      </div>
    </div>
  );
}
function Onboarding({ step, setStep, answers, setAnswers, onDone }) {
  const s = STEPS[step];
  const [pts, setPts] = useState(answers.draw || []);
  const set = v => setAnswers({ ...answers, [s.key]: v });
  const val = s.kind === "draw" ? pts : answers[s.key];
  const ready = s.kind === "draw" ? pts.length >= 3 : (val !== undefined && val !== "" && val !== null);
  const next = () => {
    if (s.kind === "draw") setAnswers({ ...answers, draw: pts });
    if (step < STEPS.length - 1) setStep(step + 1); else onDone();
  };
  return (
    <>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "64px 16px 24px", background: ink, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <Pressable onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} style={{ width: 52, height: 52, borderRadius: "50%", background: black, display: "flex", alignItems: "center", justifyContent: "center", cursor: step > 0 ? "pointer" : "default", opacity: step > 0 ? 1 : 0.4, flexShrink: 0 }}>
            <Ico paths={I.chevL} size={24} color={ink50} />
          </Pressable>
          <div style={{ flex: 1, height: 4, borderRadius: 3, background: inkUp }}>
            <div style={{ width: `${((step + 1) / STEPS.length) * 100}%`, height: "100%", borderRadius: 3, background: ink50, transition: `width .35s ${SPRING}` }} />
          </div>
          <Pressable onClick={onDone} style={{ color: sec, fontSize: 15, fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Skip</Pressable>
        </div>
        <p style={{ color: text, fontSize: 27, fontWeight: 600, letterSpacing: -0.6, marginBottom: s.sub ? 8 : 24 }}>{s.title}</p>
        {s.sub && <p style={{ color: sec, fontSize: 16, marginBottom: 24 }}>{s.sub}</p>}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(s.kind === "text" || s.kind === "location") && <OnbField value={val} onChange={set} ph={s.ph} />}
          {s.kind === "single" && <Chips options={s.options} value={val} onChange={set} />}
          {s.kind === "draw" && <DrawPlot points={pts} setPoints={setPts} />}
          {s.kind === "date" && <DatePick value={val} onChange={set} />}
        </div>
        <Pressable onClick={ready ? next : undefined} disabled={!ready} scale={0.98} style={{ background: ready ? ink50 : inkUp, color: ready ? ink : ter, borderRadius: 999, padding: 20, textAlign: "center", fontSize: 18, fontWeight: 600, cursor: ready ? "pointer" : "default" }}>
          {step === STEPS.length - 1 ? "Open my farm" : "Continue"}
        </Pressable>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)", flexShrink: 0 }} />
      </div>
    </>
  );
}

/* ===================== MAP LAYER (collapsed home) ===================== */
function MapPlots() {
  return (
    <>
      <svg viewBox="0 0 402 874" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }}>
        {MAP_PLOTS.map((p, i) => {
          const plot = PLOTS.find(x => x.name === p.name);
          const S = p.size;
          return (
            <g key={i} transform={`translate(${p.cx - S / 2} ${p.cy - S / 2}) scale(${S / 100})`}>
              <polygon points={plot.shape} fill="rgba(8,9,13,0.5)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" transform={plot.rot ? `rotate(${plot.rot} 50 50)` : undefined} />
            </g>
          );
        })}
      </svg>
      {MAP_PLOTS.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.cx, top: p.cy, transform: "translate(-50%,-50%)", zIndex: 6 }}>
          <div style={{ position: "relative", background: black, borderRadius: 999, padding: "8px 16px" }}>
            <span style={{ color: white, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
            <div style={{ position: "absolute", top: -8, right: -8, background: BR.blue, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: ink50, fontSize: 11, fontWeight: 600 }}>{p.count}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
function CoachCallout({ onClose }) {
  return (
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 188, zIndex: 30, animation: "orthRise .4s ease-out both" }}>
      <div style={{ position: "relative", background: black, borderRadius: 24, padding: "22px 22px 20px" }}>
        <Pressable onClick={onClose} style={{ position: "absolute", top: 18, right: 18, cursor: "pointer", zIndex: 2 }}>
          <Ico paths={I.x} size={20} color={ink400} />
        </Pressable>
        <p style={{ color: ink50, fontSize: 17, lineHeight: 1.45, margin: 0, paddingRight: 24 }}>
          Hey Antony! Let's create and profile your first plot. The more details you share, the more personalised and accurate your plans and insights will be.
        </p>
        <Pressable style={{ marginTop: 20, background: inkUp, borderRadius: 999, padding: "16px", textAlign: "center" }}>
          <span style={{ color: ink50, fontSize: 16, fontWeight: 600 }}>Mark your next plot</span>
        </Pressable>
        <div style={{ position: "absolute", bottom: -9, left: 30, width: 22, height: 22, background: black, transform: "rotate(45deg)", borderRadius: 4 }} />
      </div>
    </div>
  );
}
function HomeMap({ onExpand, coach, onCloseCoach }) {
  const [showCoach, setShowCoach] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowCoach(true), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,15,19,0.35), transparent 22%, transparent 70%, rgba(12,15,19,0.55))", zIndex: 4 }} />
      <MapPlots />
      <TopNav />
      {coach && showCoach && <CoachCallout onClose={onCloseCoach} />}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 108, zIndex: 30 }}>
        <InputBar ph="Ask about your farm..." bg={ink} />
      </div>
      <Pressable onClick={onExpand} scale={0.99} style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 35, background: "linear-gradient(180deg, #000000, #0c0f13)", borderRadius: 30, padding: "14px 22px 26px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 14 }}>
          <div style={{ width: 38, height: 5, borderRadius: 3, background: ink700 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: text, fontSize: 21, fontWeight: 600, letterSpacing: -0.5 }}>Valin Farm</span>
            <Ico paths={I.chevD} size={20} color={sec} />
          </div>
          <div style={{ background: BR.blue, borderRadius: 999, padding: "5px 12px", display: "flex", alignItems: "center" }}>
            <span style={{ color: ink50, fontSize: 11.5, fontWeight: 600 }}>4 upcoming actions</span>
          </div>
        </div>
      </Pressable>
    </>
  );
}

/* ===================== FARM SHEET (unchanged design) ===================== */
function ActionCard({ a, onClick }) {
  return (
    <Pressable onClick={onClick} style={{ minWidth: 280, width: 280, background: black, borderRadius: 20, padding: 18, marginRight: 12, marginBottom: 26, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 138, cursor: "pointer" }}>
      <p style={{ color: text, fontSize: 15, fontWeight: 500, lineHeight: 1.42, whiteSpace: "pre-line" }}>{a.title}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: sec, fontSize: 13 }}>{a.plot}</span>
        <StatusPill status={a.status} />
      </div>
    </Pressable>
  );
}
function PlanCard({ p, onClick }) {
  return (
    <Pressable onClick={onClick} scale={0.98} style={{ minWidth: 320, width: 320, borderRadius: 22, overflow: "hidden", marginRight: 12, marginBottom: 28, background: black, cursor: "pointer" }}>
      <div style={{ height: 152, position: "relative", background: ink900, overflow: "hidden" }}>
        <img src={p.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 11, right: 11, background: BR.blue, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: white, fontSize: 11, fontWeight: 600 }}>{p.cur}</span>
        </div>
      </div>
      <div style={{ background: white, padding: "15px 16px 17px" }}>
        <p style={{ color: ink900, fontSize: 18, fontWeight: 600, marginBottom: 13, letterSpacing: -0.3 }}>{p.title}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ color: ink400, fontSize: 13 }}>{p.cur}/{p.total}</span>
            <Dots cur={p.cur} total={p.total} onWhite />
          </div>
          <div style={{ background: black, borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 7 }}>
            {(() => { const ps = PLOTS.find(x => x.name === p.plot); return ps && <PlotGlyph shape={ps.shape} rot={ps.rot} size={15} />; })()}
            <span style={{ color: white, fontSize: 13, fontWeight: 500 }}>{p.plot}</span>
          </div>
        </div>
      </div>
    </Pressable>
  );
}
function FileCard({ label, count, img, add }) {
  const base = { borderRadius: 18, overflow: "hidden", aspectRatio: "1", position: "relative", cursor: "pointer" };
  if (add) return (
    <Pressable style={{ ...base, background: black, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7 }}>
      <Ico paths={I.plus} size={22} color={ter} />
      <span style={{ color: ter, fontSize: 11.5, textAlign: "center", lineHeight: 1.3 }}>Add new<br />files</span>
    </Pressable>
  );
  return (
    <Pressable style={{ ...base }}>
      <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 15 }}>
        <span style={{ color: ink50, fontSize: 14, fontWeight: 600 }}>{label}</span>
        <span style={{ color: ink50, fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{count}</span>
      </div>
    </Pressable>
  );
}
function PlotRow({ p }) {
  return (
    <div style={{ background: black, borderRadius: 20, padding: "16px 16px 0", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <PlotGlyph shape={p.shape} rot={p.rot} size={62} dots sw={1.2} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <span style={{ color: text, fontSize: 17, fontWeight: 600 }}>{p.name}</span>
            <Ico paths={I.edit} size={13} color={ter} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
            <Ico paths={I.arrowUpRight} size={12} color={sec} />
            <span style={{ color: sec, fontSize: 14 }}>{p.sub}</span>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <span style={{ color: sec, fontSize: 13 }}>{p.size}</span>
            <span style={{ color: ter, fontSize: 13 }}>·</span>
            <span style={{ color: sec, fontSize: 13 }}>{p.crop}</span>
          </div>
        </div>
        <Ico paths={I.chevR} size={18} color={ter} />
      </div>
      <div style={{ marginTop: 14, paddingBottom: 13, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 3, background: inkUp, overflow: "hidden" }}>
          <div style={{ width: `${p.progress}%`, height: "100%", borderRadius: 3, background: p.locked ? ink500 : hyper }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Ico paths={p.locked ? I.label : I.labelSolid} size={13} color={p.locked ? sec : hyper} />
          <span style={{ color: p.locked ? sec : hyper, fontSize: 11.5, fontWeight: p.locked ? 400 : 600, whiteSpace: "nowrap" }}>
            {p.locked ? "Unlock Hyperplot" : "Hyperplot"}
          </span>
        </div>
      </div>
    </div>
  );
}
const SECT = { color: text, fontSize: 18, fontWeight: 600, letterSpacing: -0.2 };
const VIEWALL = { color: sec, fontSize: 13 };
function FarmSheet({ z, show, onExited, onPop, onAction, onPlan }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z }}>
      <Pressable noHaptic onClick={onPop} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 128, zIndex: 5, cursor: "pointer" }} />
      <TopNav />
      <Sheet show={show} onExited={onExited} onDismiss={onPop} top={128} background={ink}>
        <div style={{ flexShrink: 0, padding: "26px 16px 0" }}>
          <p style={{ color: sec, fontSize: 13, marginBottom: 6 }}>Central Hill, France</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: text, fontSize: 27, fontWeight: 600, letterSpacing: -0.6 }}>Valin Farm</span>
              <Ico paths={I.chevD} size={20} color={sec} />
            </div>
            <Pressable style={{ background: inkUp, borderRadius: 22, padding: "8px 11px 8px 16px", display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: text, fontSize: 14, fontWeight: 500, lineHeight: 1 }}>Field</span>
              <Ico paths={I.chevR} size={13} color={sec} />
            </Pressable>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}>
          <div style={{ display: "flex", gap: 13, padding: "2px 16px 26px" }}>
            {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 58, height: 58, borderRadius: "50%", flexShrink: 0, background: black }} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 14px" }}>
            <span style={SECT}>Upcoming Actions</span><span style={VIEWALL}>View all</span>
          </div>
          <div style={{ display: "flex", overflowX: "auto", padding: "0 0 0 16px" }}>
            {ACTIONS.map((a, i) => <ActionCard key={i} a={a} onClick={() => onAction(a)} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 14px" }}>
            <span style={SECT}>Active Plans</span><span style={VIEWALL}>View all</span>
          </div>
          <div style={{ display: "flex", overflowX: "auto", padding: "0 0 0 16px" }}>
            {PLANS.map((p, i) => <PlanCard key={i} p={p} onClick={() => onPlan(p)} />)}
          </div>
          <div style={{ padding: "0 16px 14px" }}><span style={SECT}>Files from your farm</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "0 16px 28px" }}>
            <FileCard label="Documents" count={7} img="/hans-Qmg1Fh-9nII-unsplash.jpg" />
            <FileCard label="Media" count={2} img="/josefin-zcQuTAJHi-c-unsplash.jpg" />
            <FileCard add />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={SECT}>Your plots</span><Ico paths={I.plus} size={18} color={sec} /></div>
            <span style={VIEWALL}>View all</span>
          </div>
          <div style={{ padding: "0 16px" }}>{PLOTS.map((p, i) => <PlotRow key={i} p={p} />)}</div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "90px 16px 24px", background: BOTTOM_GRAD }}>
          <InputBar ph="Ask about your farm..." />
        </div>
      </Sheet>
    </div>
  );
}

/* ===================== PLAN / ACTION shared header ===================== */
function PlanHeader({ plan, onBack, compact, lift = 0 }) {
  return (
    <div style={{ flexShrink: 0, position: "relative" }}>
      <div style={{ height: compact ? 132 : 196, background: ink900, position: "relative", overflow: "hidden" }}>
        <img src={plan.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: HEADER_GRAD }} />
        <Pressable onClick={onBack} style={{ position: "absolute", top: 30, left: 14, cursor: "pointer", zIndex: 10 }}>
          <Ico paths={I.chevL} size={24} color={ink50} />
        </Pressable>
      </div>
      <div style={{ padding: "0 16px 10px", marginTop: compact ? -44 : -52, position: "relative", transform: `translateY(${lift}px)`, transition: `transform .44s ${SPRING}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ color: text, fontSize: 27, fontWeight: 600, letterSpacing: -0.5 }}>{plan.title}</span>
          <Ico paths={I.edit} size={17} color={sec} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: sec, fontSize: 14 }}>{plan.cur}/{plan.total}</span>
            <Dots cur={plan.cur} total={plan.total} />
          </div>
          <PlotPill name={plan.plot} big />
        </div>
      </div>
    </div>
  );
}

/* ===================== PLAN DETAIL (Image 4) ===================== */
function PlanListCard({ a, onClick }) {
  const lines = a.title.split("\n");
  return (
    <Pressable onClick={onClick} style={{ background: black, borderRadius: 20, padding: 18, marginBottom: 12, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <p style={{ color: text, fontSize: 16, fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{lines.map((l, i) => <span key={i}>{l}{i < lines.length - 1 && <br />}</span>)}</p>
        <Ico paths={actionIcon(a.cat)} size={20} color={sec} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <StatusPill status={a.status} big />
        <span style={{ color: sec, fontSize: 13.5 }}>{a.due} · {a.cat}</span>
      </div>
    </Pressable>
  );
}
function PlanDetail({ z, show, onExited, plan, onPop, onAction }) {
  const acts = ACTIONS.filter(a => a.plot === plan.plot);
  const list = acts.length ? acts : ACTIONS.slice(0, 3);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z }}>
      <Pressable noHaptic onClick={onPop} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 128, zIndex: 5, cursor: "pointer" }} />
      <TopNav />
      <Sheet show={show} onExited={onExited} onDismiss={onPop} top={128} background={ink} grabber="light">
        <PlanHeader plan={plan} onBack={onPop} />
        <div style={{ display: "flex", gap: 10, padding: "20px 16px 16px" }}>
          {["", "", "", ""].map((label, i) => (
            <Pressable key={i} style={{ flex: 1, height: 34, borderRadius: 999, background: black, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {label && <span style={{ color: sec, fontSize: 13.5, fontWeight: 500 }}>{label}</span>}
            </Pressable>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 110px" }}>
          {list.map((a, i) => <PlanListCard key={i} a={a} onClick={() => onAction(a)} />)}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "90px 16px 24px", background: BOTTOM_GRAD }}>
          <InputBar ph="Ask about your plan..." />
        </div>
      </Sheet>
    </div>
  );
}

/* ===================== ACTION DETAIL (Image 3) ===================== */
function Field({ label, children, tall }) {
  return (
    <div style={{ background: ink900, borderRadius: tall ? 29 : 999, padding: tall ? "17px 22px 19px" : "0 22px", minHeight: tall ? undefined : 58, display: "flex", flexDirection: tall ? "column" : "row", alignItems: tall ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ color: sec, fontSize: 14, marginBottom: tall ? 8 : 0 }}>{label}</span>
      {children}
    </div>
  );
}
function ActionDetail({ z, show, onExited, plan, action, onPop, onResolve }) {
  const lines = action.title.split("\n");
  const btn = { flex: 1, borderRadius: 999, padding: "16px", textAlign: "center", fontSize: 16, fontWeight: 600, cursor: "pointer" };
  // header eases up 40px in sync with the card, giving the card more room
  const [up, setUp] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setUp(show)); return () => cancelAnimationFrame(id); }, [show]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z }}>
      <Pressable noHaptic onClick={onPop} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 128, zIndex: 5, cursor: "pointer" }} />
      <TopNav />
      {/* fixed plan image header — image stays put, the title block lifts up with the card */}
      <div onClick={onPop} style={{ position: "absolute", top: 128, left: 0, right: 0, bottom: 0, background: ink, borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 6, overflow: "hidden", cursor: "pointer" }}>
        <PlanHeader plan={plan} onBack={onPop} lift={up ? -40 : 0} />
      </div>
      {/* dark action card slides up over the image */}
      <Sheet show={show} onExited={onExited} onDismiss={onPop} top={284} background={black} zIndex={20}>
        <div style={{ flexShrink: 0, padding: "30px 16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <p style={{ color: text, fontSize: 19, fontWeight: 600, lineHeight: 1.35, margin: 0 }}>{lines.map((l, i) => <span key={i}>{l}{i < lines.length - 1 && <br />}</span>)}</p>
          <Ico paths={actionIcon(action.cat)} size={22} color={sec} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 184px" }}>
          <Field label="Status"><StatusPill status={action.status} big /></Field>
          <Field label="Due date"><span style={{ color: text, fontSize: 15, fontWeight: 500 }}>{action.due}</span></Field>
          <Field label="Category"><span style={{ color: text, fontSize: 15, fontWeight: 500 }}>{action.cat}</span></Field>
          <Field label="Plot"><span style={{ color: text, fontSize: 15, fontWeight: 500 }}>{action.plot}</span></Field>
          <Field label="Notes" tall><span style={{ color: ink200, fontSize: 15, lineHeight: 1.5 }}>{action.note}</span></Field>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "90px 16px 24px", background: BOTTOM_GRAD }}>
          <div style={{ marginBottom: 14 }}><InputBar ph="Ask about this action..." bg={ink} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pressable onClick={onResolve} style={{ ...btn, background: ink900, color: text }}>Skip</Pressable>
            <Pressable onClick={onResolve} style={{ ...btn, background: ink900, color: text }}>Later</Pressable>
            <Pressable onClick={onResolve} style={{ ...btn, flex: 1.2, background: BR.green, color: white }}>Done</Pressable>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

/* ===================== app / router ===================== */
export default function App() {
  const [onboard, setOnboard] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sheets, setSheets] = useState([]);        // stack over the map: "farm" | "plan" | "action"
  const [exiting, setExiting] = useState(false);    // top sheet is animating out
  const [selPlan, setSelPlan] = useState(PLANS[0]);
  const [selAction, setSelAction] = useState(ACTIONS[0]);
  const [coach, setCoach] = useState(true);

  const push = name => setSheets(s => [...s, name]);
  const pop = () => { if (sheets.length) setExiting(true); };
  const onExited = () => { setSheets(s => s.slice(0, -1)); setExiting(false); };

  const openFarm = () => push("farm");
  const openPlan = p => { setSelPlan(p); push("plan"); };
  const openActionFromFarm = a => { setSelPlan(PLANS.find(p => p.plot === a.plot) || PLANS[0]); setSelAction(a); push("action"); };
  const openActionFromPlan = a => { setSelAction(a); push("action"); };

  if (onboard)
    return (
      <Frame>
        <Onboarding step={step} setStep={setStep} answers={answers} setAnswers={setAnswers} onDone={() => setOnboard(false)} />
      </Frame>
    );

  const topIdx = sheets.length - 1;
  return (
    <Frame>
      <div style={{ position: "absolute", inset: 0, background: "#141719", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <HomeMap onExpand={openFarm} coach={coach} onCloseCoach={() => setCoach(false)} />
      </div>
      {sheets.map((name, i) => {
        const show = !(exiting && i === topIdx);
        const z = 10 + i * 10;
        const shared = { key: name + i, z, show, onExited, onPop: pop };
        if (name === "farm") return <FarmSheet {...shared} onAction={openActionFromFarm} onPlan={openPlan} />;
        if (name === "plan") return <PlanDetail {...shared} plan={selPlan} onAction={openActionFromPlan} />;
        if (name === "action") return <ActionDetail {...shared} plan={selPlan} action={selAction} onResolve={pop} />;
        return null;
      })}
    </Frame>
  );
}
