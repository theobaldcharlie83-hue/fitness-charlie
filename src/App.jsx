import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
`;

const C = {
  bg:       "#F7F5F0",
  surface:  "#FFFFFF",
  border:   "#E8E2D9",
  text:     "#1C1917",
  muted:    "#A09890",
  faint:    "#EDE9E2",
  accent:   "#2D5A27",
  accentBg: "#EBF2EA",
  accentMid:"#4A8C42",
  danger:   "#C0392B",
};

const TYPE_META = {
  A: { label: "Renforcement", sub: "Pompes · Biceps · Triceps · Gainage", icon: "↑", day: "Jour A" },
  B: { label: "Fitness",      sub: "Cardio 20 min · Biceps · Triceps",    icon: "◎", day: "Jour B" },
};

const EXERCISE_INFO = {
  pompes_poignees: {
    friendlyName: "Pompes sur poignées", difficulty: 2,
    muscles: ["Pectoraux", "Triceps", "Épaules"],
    steps: ["Pose les poignées au sol, légèrement plus larges que les épaules.", "Corps bien droit de la tête aux talons — comme une planche.", "Descends lentement jusqu'à frôler le sol.", "Pousse fort pour remonter en expirant."],
    tip: "Ne laisse pas les hanches tomber. Garde la ligne du corps parfaitement droite.",
    why: "Les poignées offrent plus d'amplitude qu'une pompe classique, ce qui sollicite mieux les pectoraux."
  },
  elev_laterale: {
    friendlyName: "Élévations latérales", difficulty: 1,
    muscles: ["Épaules (deltoïdes)"],
    steps: ["Debout, haltères de 3 kg dans chaque main, bras le long du corps.", "Lève les bras sur les côtés jusqu'à hauteur d'épaule.", "Tiens une demi-seconde en haut.", "Redescends lentement — ne lâche pas d'un coup."],
    tip: "Garde les coudes légèrement fléchis. Monte comme si tu versais un verre sur le côté.",
    why: "Développe les épaules en largeur pour une meilleure posture et un maintien renforcé."
  },
  ext_triceps: {
    friendlyName: "Extension triceps (élastique)", difficulty: 1,
    muscles: ["Triceps"],
    steps: ["Fixe l'élastique en hauteur ou tiens-le derrière la tête.", "Coude plié, main derrière la nuque.", "Tends le bras vers le bas en gardant le coude immobile.", "Reviens lentement à la position de départ."],
    tip: "Seul l'avant-bras bouge. Le coude reste fixe, collé près de la tête.",
    why: "Isole parfaitement les triceps — un muscle souvent négligé."
  },
  rowing: {
    friendlyName: "Rowing (rame) élastique", difficulty: 1,
    muscles: ["Dos", "Biceps"],
    steps: ["Assis au sol, jambes tendues, élastique passé autour des pieds.", "Attrape les deux extrémités, dos bien droit.", "Tire les coudes vers l'arrière comme si tu ramais.", "Reviens lentement vers l'avant."],
    tip: "Serre les omoplates ensemble à la fin — c'est là que le dos travaille vraiment.",
    why: "Renforce le dos et corrige les mauvaises postures dues aux longues heures assis."
  },
  curl: {
    friendlyName: "Curl biceps (élastique)", difficulty: 1,
    muscles: ["Biceps"],
    steps: ["Debout, élastique passé sous les pieds.", "Attrape chaque extrémité, paumes vers le plafond.", "Ramène les mains vers les épaules en pliant les coudes.", "Redescends lentement."],
    tip: "Les coudes restent le long du corps pendant tout le mouvement.",
    why: "Développe les biceps — le muscle de l'avant du bras."
  },
  squat: {
    friendlyName: "Squat (élastique)", difficulty: 1,
    muscles: ["Quadriceps (cuisses)", "Fessiers"],
    steps: ["Élastique sous les pieds, pieds à largeur d'épaules.", "Mains à hauteur d'épaule pour créer de la résistance.", "Descends comme pour t'asseoir sur une chaise, dos droit.", "Remonte en poussant fort dans les talons."],
    tip: "Les genoux suivent la direction des orteils — ne les laisse jamais partir vers l'intérieur.",
    why: "Le squat est l'exercice roi des jambes et des fessiers."
  },
  hip_thrust: {
    friendlyName: "Poussée de hanches (élastique)", difficulty: 1,
    muscles: ["Fessiers", "Ischio-jambiers"],
    steps: ["Allongé sur le dos, genoux pliés, pieds à plat au sol.", "Élastique posé sur les hanches, tenu avec les mains.", "Pousse les hanches vers le plafond en serrant les fessiers.", "Tiens 1 seconde en haut, redescends sans toucher le sol."],
    tip: "Serre vraiment fort les fessiers en haut du mouvement — c'est là qu'ils se renforcent.",
    why: "L'exercice le plus efficace pour les fessiers, reconnu par les athlètes de haut niveau."
  },
  cours_fitness: {
    friendlyName: "Cours fitness guidé (20 min)", difficulty: 1,
    muscles: ["Corps entier"],
    steps: ["Lance ton cours habituel (vidéo, application...).", "Suis le rythme sans te mettre en danger.", "Si tu fatigues, ralentis plutôt que de t'arrêter.", "Bois de l'eau entre les exercices."],
    tip: "La régularité compte plus que l'intensité. Finir à 70% vaut mieux que d'abandonner.",
    why: "Combine cardio et renforcement pour une séance complète et équilibrée."
  },
  gainage: {
    friendlyName: "Gainage (la planche)", difficulty: 2,
    muscles: ["Abdominaux profonds", "Dos"],
    steps: ["Appuie-toi sur les avant-bras et les orteils, corps en ligne droite.", "Rentre légèrement le ventre sans retenir ta respiration.", "Tiens la position aussi longtemps que possible.", "Respire normalement pendant toute la durée."],
    tip: "Si tu trembles, c'est normal ! Commence par 20 secondes si 45 s c'est trop.",
    why: "Renforce la sangle abdominale profonde — la base de toute stabilité corporelle."
  },
  crunch: {
    friendlyName: "Crunch abdominal", difficulty: 1,
    muscles: ["Abdominaux"],
    steps: ["Allongé sur le dos, genoux pliés, mains derrière les oreilles.", "Contracte le ventre et soulève les épaules du sol.", "Tiens une demi-seconde en haut — tu dois sentir la brûlure.", "Redescends sans poser complètement la tête."],
    tip: "Ne tire pas sur la nuque. Les mains sont juste là pour soutenir la tête.",
    why: "Renforce les abdominaux, le «pack» visible à l'avant du ventre."
  },
  mountain: {
    friendlyName: "Mountain climbers", difficulty: 2,
    muscles: ["Abdominaux", "Quadriceps", "Cardio"],
    steps: ["Position de pompe, bras tendus, dos droit.", "Ramène un genou vers la poitrine rapidement.", "Repousse-le et enchaîne aussitôt avec l'autre.", "Alterne comme si tu escaladais une paroi verticale."],
    tip: "Garde les hanches basses. Un rythme régulier vaut mieux qu'une vitesse folle.",
    why: "Gainage et cardio combinés — ventre et cœur travaillent en même temps."
  }
};

const GLOSSARY = [
  { term: "Série",          emoji: "↺", def: "Un groupe de répétitions sans pause. «3 séries» = fais l'exercice, repose-toi, recommence, repose-toi, recommence." },
  { term: "Répétition",     emoji: "1", def: "Un mouvement complet, aller ET retour. Une pompe du bas vers le haut = 1 répétition." },
  { term: "Temps de repos", emoji: "◌", def: "La pause entre deux séries. Essentielle. Sans repos, les muscles s'épuisent trop vite. 45–90 s, c'est idéal." },
  { term: "Résistance",     emoji: "∿", def: "La «charge» de l'élastique. Plus tu l'étires, plus c'est difficile. Commence léger et augmente progressivement." },
  { term: "Amplitude",      emoji: "⟺", def: "La plage de mouvement utilisée. Un mouvement complet est toujours plus efficace qu'un mouvement partiel." },
  { term: "Progressivité",  emoji: "↗", def: "Augmenter la difficulté semaine après semaine. C'est ce qui produit des résultats visibles." },
];

const PROGRAM = {
  A: { ...TYPE_META.A, color: C.accent, exercises: [
    { id: "pompes_poignees", sets: 3, reps: 12 },
    { id: "curl",            sets: 3, reps: 15 },
    { id: "ext_triceps",     sets: 3, reps: 12 },
    { id: "gainage",         sets: 3, reps: 45, isTime: true },
    { id: "crunch",          sets: 3, reps: 20 },
    { id: "mountain",        sets: 3, reps: 30, isTime: true },
  ]},
  B: { ...TYPE_META.B, color: C.accent, exercises: [
    { id: "cours_fitness", sets: 1, reps: 1, note: "Lance ton cours habituel" },
    { id: "curl",          sets: 3, reps: 15 },
    { id: "ext_triceps",   sets: 3, reps: 12 },
  ]},
};

const computeStreak = (sessions) => {
  if (!sessions.length) return 0;
  const unique = [...new Set(sessions.map(s => new Date(s.date).toDateString()))].sort((a,b)=>new Date(b)-new Date(a));
  const today = new Date().toDateString(), yesterday = new Date(Date.now()-86400000).toDateString();
  if (unique[0]!==today && unique[0]!==yesterday) return 0;
  let streak = 0;
  for (let i=0;i<unique.length;i++) {
    if (i===0){streak++;continue;}
    if (Math.round((new Date(unique[i-1])-new Date(unique[i]))/86400000)===1) streak++; else break;
  }
  return streak;
};

const DIFF = { 1:{ label:"Débutant" }, 2:{ label:"Intermédiaire" }, 3:{ label:"Avancé" } };
function DiffDots({ level }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
      <span style={{ display:"inline-flex", gap:3 }}>
        {[1,2,3].map(i=><span key={i} style={{ width:5, height:5, borderRadius:"50%", background: i<=level ? C.text : C.border, display:"inline-block" }}/>)}
      </span>
      <span style={{ fontSize:11, color:C.muted, fontWeight:500 }}>{DIFF[level].label}</span>
    </span>
  );
}

const T = {
  display: { fontFamily:"'Fraunces', Georgia, serif", fontWeight:600, color:C.text, letterSpacing:"-0.02em" },
  body:    { fontFamily:"'DM Sans', sans-serif", color:C.text },
  muted:   { fontFamily:"'DM Sans', sans-serif", color:C.muted },
  label:   { fontFamily:"'DM Sans', sans-serif", fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted },
};
const card = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:16 };
const btn  = (variant="primary") => ({
  display:"block", width:"100%", padding:"13px 20px", borderRadius:12, cursor:"pointer", border:"none",
  fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, letterSpacing:"0.01em", transition:"opacity 0.15s",
  ...(variant==="primary"  ? { background:C.text, color:C.bg } : {}),
  ...(variant==="accent"   ? { background:C.accentBg, color:C.accent } : {}),
  ...(variant==="disabled" ? { background:C.faint, color:C.muted, cursor:"not-allowed" } : {}),
});

function GuideCard({ exId }) {
  const [open, setOpen] = useState(false);
  const info = EXERCISE_INFO[exId];
  if (!info) return null;
  return (
    <div style={{ ...card, overflow:"hidden" }}>
      <button onClick={()=>setOpen(!open)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"16px 18px", textAlign:"left", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ ...T.body, fontWeight:600, marginBottom:6 }}>{info.friendlyName}</div>
          <DiffDots level={info.difficulty}/>
        </div>
        <div style={{ ...T.muted, fontSize:18, fontWeight:300, lineHeight:1, marginTop:2, flexShrink:0, transform:open?"rotate(45deg)":"rotate(0deg)", transition:"transform 0.2s" }}>+</div>
      </button>
      {open && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div style={{ ...T.label, marginBottom:8 }}>Muscles ciblés</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {info.muscles.map(m=>(<span key={m} style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:500, background:C.faint, color:C.text, borderRadius:20, padding:"3px 10px" }}>{m}</span>))}
            </div>
          </div>
          <div>
            <div style={{ ...T.label, marginBottom:10 }}>Comment faire</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {info.steps.map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, width:18, flexShrink:0, paddingTop:2 }}>{i+1}.</span>
                  <p style={{ ...T.body, fontSize:13, lineHeight:1.6, margin:0 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.faint, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ ...T.label, marginBottom:6 }}>Conseil de forme</div>
            <p style={{ ...T.body, fontSize:13, lineHeight:1.6, margin:0 }}>{info.tip}</p>
          </div>
          <div>
            <div style={{ ...T.label, marginBottom:6 }}>Pourquoi cet exercice ?</div>
            <p style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.6, margin:0 }}>{info.why}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GlossaryModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(28,25,23,0.4)", zIndex:200, backdropFilter:"blur(2px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, borderRadius:20, width:"100%", maxWidth:448, maxHeight:"82vh", overflow:"hidden", display:"flex", flexDirection:"column", border:`1px solid ${C.border}` }}>
        <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ ...T.display, fontSize:"1.5rem" }}>Lexique</div>
            <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, marginTop:3 }}>Les mots du sport expliqués simplement</div>
          </div>
          <button onClick={onClose} style={{ background:C.faint, border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
          {GLOSSARY.map(({term,emoji,def})=>(
            <div key={term} style={{ ...card, padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:C.muted, width:20, textAlign:"center" }}>{emoji}</span>
                <span style={{ ...T.body, fontWeight:600, fontSize:14 }}>{term}</span>
              </div>
              <p style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.6, margin:0 }}>{def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExerciseGuideModal({ exId, onClose }) {
  const info = EXERCISE_INFO[exId];
  if (!info) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(28,25,23,0.5)", zIndex:300, backdropFilter:"blur(2px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, borderRadius:20, width:"100%", maxWidth:448, maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column", border:`1px solid ${C.border}` }}>
        <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
          <div>
            <div style={{ ...T.display, fontSize:"1.25rem", marginBottom:6 }}>{info.friendlyName}</div>
            <DiffDots level={info.difficulty}/>
          </div>
          <button onClick={onClose} style={{ background:C.faint, border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:12 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:"16px 18px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div style={{ ...T.label, marginBottom:8 }}>Muscles ciblés</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {info.muscles.map(m=>(<span key={m} style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:500, background:C.faint, color:C.text, borderRadius:20, padding:"3px 10px" }}>{m}</span>))}
            </div>
          </div>
          <div>
            <div style={{ ...T.label, marginBottom:10 }}>Comment faire</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {info.steps.map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, width:18, flexShrink:0, paddingTop:2 }}>{i+1}.</span>
                  <p style={{ ...T.body, fontSize:13, lineHeight:1.6, margin:0 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.faint, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ ...T.label, marginBottom:6 }}>Conseil de forme</div>
            <p style={{ ...T.body, fontSize:13, lineHeight:1.6, margin:0 }}>{info.tip}</p>
          </div>
          <div>
            <div style={{ ...T.label, marginBottom:6 }}>Pourquoi cet exercice ?</div>
            <p style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.6, margin:0 }}>{info.why}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  const [workout, setWorkout] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);

  useEffect(()=>{
    try {
      const saved = localStorage.getItem("fit-charlie-v1");
      if (saved) setSessions(JSON.parse(saved));
    } catch {}
    setLoading(false);
  },[]);

  const save = (s) => {
    setSessions(s);
    try { localStorage.setItem("fit-charlie-v1", JSON.stringify(s)); } catch {}
  };

  const nextType = sessions.length === 0 ? "A" : sessions.at(-1)?.type === "A" ? "B" : "A";

  const startWorkout = type => {
    setWorkout({ type, startTime:Date.now(), exercises: PROGRAM[type].exercises.map(ex=>({
      ...ex, ...EXERCISE_INFO[ex.id], sets: Array(ex.sets).fill(null).map(()=>({reps:ex.reps,done:false}))
    }))});
    setScreen("workout");
  };

  const finishWorkout = () => {
    const s = { id:Date.now(), date:new Date().toISOString(), type:workout.type,
      duration:Math.round((Date.now()-workout.startTime)/60000),
      exercises:workout.exercises.map(ex=>({ id:ex.id, name:ex.friendlyName||ex.id, sets:ex.sets.filter(s=>s.done).map(s=>({reps:s.reps})) }))};
    save([...sessions,s]); setWorkout(null); setScreen("dashboard");
  };

  const deleteSession = (id) => {
    const s = sessions.filter(x => x.id !== id);
    save(s);
  };

  const openPreview = (type) => {
    setPreviewType(type);
    setScreen("preview");
  };

  if (loading) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Chargement…</span>
    </div>
  );

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
        {screen==="dashboard" && <Dashboard sessions={sessions} streak={computeStreak(sessions)} nextType={nextType} openPreview={openPreview} setScreen={setScreen} openGlossary={()=>setShowGlossary(true)}/>}
        {screen==="preview" && previewType && <WorkoutPreviewScreen type={previewType} back={()=>setScreen("dashboard")} startWorkout={startWorkout} todayDone={sessions.some(s=>new Date(s.date).toDateString()===new Date().toDateString())} />}
        {screen==="workout" && workout && <WorkoutScreen workout={workout} setWorkout={setWorkout} finish={finishWorkout} back={()=>{setWorkout(null);setScreen("dashboard");}} openGlossary={()=>setShowGlossary(true)}/>}
        {screen==="progress" && <ProgressScreen sessions={sessions} back={()=>setScreen("dashboard")}/>}
        {screen==="history"  && <HistoryScreen  sessions={sessions} back={()=>setScreen("dashboard")} deleteSession={deleteSession}/>}
        {screen==="guide"    && <GuideScreen back={()=>setScreen("dashboard")} openGlossary={()=>setShowGlossary(true)}/>}
        {showGlossary && <GlossaryModal onClose={()=>setShowGlossary(false)}/>}
      </div>
    </>
  );
}

function Dashboard({ sessions, streak, nextType, openPreview, setScreen, openGlossary }) {
  const prog = PROGRAM[nextType];
  const todayDone = sessions.some(s=>new Date(s.date).toDateString()===new Date().toDateString());
  const avgDur = sessions.length ? Math.round(sessions.reduce((a,s)=>a+(s.duration||0),0)/sessions.length) : null;
  return (
    <div style={{ maxWidth:448, margin:"0 auto", padding:"32px 16px 80px" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ ...T.display, fontSize:"1.9rem", lineHeight:1.1 }}>Fitness Charlie</div>
          <button onClick={openGlossary} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500 }}>Lexique</button>
        </div>
        <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginTop:6 }}>
          {new Date().toLocaleDateString("fr",{weekday:"long",day:"numeric",month:"long"})}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
        {[{val:streak,label:"Jours consécutifs"},{val:sessions.length,label:"Séances totales"},{val:avgDur?`${avgDur} min`:"—",label:"Durée moyenne"}].map(({val,label})=>(
          <div key={label} style={{ ...card, padding:"14px 12px", textAlign:"center" }}>
            <div style={{ ...T.display, fontSize:"1.5rem" }}>{val}</div>
            <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:11, marginTop:4, lineHeight:1.3 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...card, padding:"20px", marginBottom:12 }}>
        <div style={{ ...T.label, marginBottom:4 }}>{prog.day} · Recommandé</div>
        <div style={{ ...T.display, fontSize:"1.6rem", marginBottom:4 }}>{prog.label}</div>
        <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:18 }}>{prog.sub}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
          {prog.exercises.slice(0,4).map(ex=>(
            <span key={ex.id} style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:500, background:C.faint, color:C.text, borderRadius:20, padding:"4px 10px" }}>
              {EXERCISE_INFO[ex.id]?.friendlyName.split(" ").slice(0,3).join(" ")}
            </span>
          ))}
        </div>
        {!todayDone
          ? <button onClick={()=>openPreview(nextType)} style={btn("primary")}>Démarrer la séance</button>
          : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ ...btn("accent"), textAlign:"center", borderRadius:12, padding:"13px 20px", fontSize:14, fontWeight:600, cursor:"default" }}>Séance du jour complétée ✓</div>
              <button onClick={()=>openPreview(nextType)} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600 }}>Voir les détails quand même</button>
            </div>
        }
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
        {Object.entries(PROGRAM).filter(([k])=>k!==nextType).map(([type,p])=>(
          <button key={type} onClick={()=>openPreview(type)} style={{ ...card, padding:"14px 16px", textAlign:"left", cursor:"pointer", border:`1px solid ${C.border}` }}>
            <div style={{ ...T.label, marginBottom:6 }}>{p.day}</div>
            <div style={{ ...T.display, fontSize:"1.1rem" }}>{p.label}</div>
          </button>
        ))}
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20, display:"flex", justifyContent:"space-around" }}>
        {[{s:"guide",icon:"◎",label:"Guide"},{s:"progress",icon:"↗",label:"Progression"},{s:"history",icon:"≡",label:"Historique"}].map(item=>(
          <button key={item.s} onClick={()=>setScreen(item.s)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"8px 16px" }}>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:C.muted }}>{item.icon}</span>
            <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkoutScreen({ workout, setWorkout, finish, back, openGlossary }) {
  const [elapsed, setElapsed] = useState(0);
  const [guideExId, setGuideExId] = useState(null);
  const [restSecs, setRestSecs] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const prog = PROGRAM[workout.type];
  useEffect(()=>{ const id=setInterval(()=>setElapsed(e=>e+1),1000); return()=>clearInterval(id); },[]);
  useEffect(()=>{
    if(!restActive) return;
    const id=setInterval(()=>setRestSecs(s=>{if(s<=1){setRestActive(false);return 0;}return s-1;}),1000);
    return()=>clearInterval(id);
  },[restActive]);
  const toggleSet = (ei,si) => {
    const was=workout.exercises[ei].sets[si].done;
    setWorkout({...workout,exercises:workout.exercises.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j!==si?s:{...s,done:!s.done})})});
    if(!was){setRestSecs(60);setRestActive(true);}
  };
  const updateReps = (ei,si,val) => setWorkout({...workout,exercises:workout.exercises.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j!==si?s:{...s,reps:Number(val)||0})})});
  const done=workout.exercises.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const total=workout.exercises.reduce((a,ex)=>a+ex.sets.length,0);
  const pct=total?Math.round(done/total*100):0;
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  return (
    <div style={{ background:C.bg, minHeight:"100vh", paddingBottom:100 }}>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 16px 14px", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:448, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <button onClick={back} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>← Quitter</button>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:15, fontWeight:600, color:C.text }}>{fmt(elapsed)}</span>
              <button onClick={openGlossary} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>Lexique</button>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ ...T.label, marginBottom:2 }}>{prog.day}</div>
              <div style={{ ...T.display, fontSize:"1.3rem" }}>{prog.label}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ ...T.display, fontSize:"1.5rem", color:C.accent }}>{pct}%</div>
              <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>{done}/{total} séries</div>
            </div>
          </div>
          <div style={{ background:C.faint, borderRadius:4, height:4 }}>
            <div style={{ width:`${pct}%`, background:C.accent, borderRadius:4, height:4, transition:"width 0.4s ease" }}/>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:448, margin:"0 auto", padding:"16px 16px 0" }}>
        {restActive && (
          <div style={{ ...card, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ ...T.body, fontWeight:600, fontSize:13 }}>Temps de repos</div>
              <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>Récupère avant la prochaine série</div>
            </div>
            <div style={{ ...T.display, fontSize:"1.5rem", color:C.accent }}>{restSecs}s</div>
            <button onClick={()=>{setRestActive(false);setRestSecs(0);}} style={{ background:C.faint, border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500 }}>Skip</button>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {workout.exercises.map((ex,ei)=>{
            const allDone=ex.sets.every(s=>s.done);
            const info=EXERCISE_INFO[ex.id];
            return (
              <div key={ex.id} style={{ ...card, overflow:"hidden", opacity:allDone?0.7:1, transition:"opacity 0.3s" }}>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <button
                        onClick={() => info && setGuideExId(ex.id)}
                        style={{
                          background:"none", border:"none", padding:0, cursor:info?"pointer":"default",
                          ...T.body, fontWeight:600, fontSize:14, marginBottom:5,
                          textDecoration: allDone ? "line-through" : info ? "underline dotted" : "none",
                          textDecorationColor: allDone ? C.muted : C.accentMid,
                          color: allDone ? C.muted : info ? C.accentMid : C.text,
                          textAlign:"left"
                        }}
                        title={info ? "Voir le guide technique" : undefined}
                      >
                        {info?.friendlyName||ex.id}
                      </button>
                      {info && <DiffDots level={info.difficulty}/>}
                    </div>
                    {allDone && <span style={{ color:C.accent, fontSize:16 }}>✓</span>}
                  </div>
                  {info && (<div style={{ display:"flex", flexWrap:"wrap", gap:5, margin:"10px 0" }}>{info.muscles.map(m=><span key={m} style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", background:C.faint, color:C.muted, borderRadius:20, padding:"2px 8px" }}>{m}</span>)}</div>)}
                  {ex.note && <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontStyle:"italic", marginBottom:10 }}>{ex.note}</div>}
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {ex.sets.map((set,si)=>(
                      <div key={si} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, width:52, flexShrink:0 }}>Série {si+1}</span>
                        <input type="number" value={set.reps} onChange={e=>updateReps(ei,si,e.target.value)} style={{ width:52, background:C.faint, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 4px", textAlign:"center", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", color:C.text, outline:"none" }}/>
                        <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>{ex.isTime?"sec":"reps"}</span>
                        <button onClick={()=>toggleSet(ei,si)} style={{ marginLeft:"auto", background:set.done?C.accentBg:C.faint, color:set.done?C.accent:C.muted, border:`1px solid ${set.done?C.accentMid+"40":C.border}`, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                          {set.done?"Fait ✓":"Fait"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {info && (
                  <div style={{ borderTop:`1px solid ${C.border}`, padding:"10px 16px", background:C.faint, display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ ...T.muted, fontFamily:"'Fraunces',serif", fontSize:13, flexShrink:0 }}>→</span>
                    <p style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12, lineHeight:1.5, margin:0 }}>{info.tip}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {guideExId && <ExerciseGuideModal exId={guideExId} onClose={() => setGuideExId(null)} />}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:16, background:`linear-gradient(transparent, ${C.bg} 40%)` }}>
        <div style={{ maxWidth:448, margin:"0 auto" }}>
          <button onClick={finish} disabled={pct<50} style={{ ...btn(pct>=50?"primary":"disabled"), width:"100%", padding:"14px" }}>
            {pct>=100?"Terminer la séance":pct>=50?`Terminer — ${pct}% complété`:`Encore un effort — ${pct}%`}
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideScreen({ back, openGlossary }) {
  const [activeType, setActiveType] = useState("A");
  const prog = PROGRAM[activeType];
  return (
    <div style={{ maxWidth:448, margin:"0 auto", padding:"28px 16px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={back} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>← Retour</button>
        <button onClick={openGlossary} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>Lexique</button>
      </div>
      <div style={{ ...T.display, fontSize:"1.7rem", marginBottom:4 }}>Guide des exercices</div>
      <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:20 }}>Appuie sur un exercice pour tout savoir</div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {Object.entries(PROGRAM).map(([type,p])=>(
          <button key={type} onClick={()=>setActiveType(type)} style={{ flex:1, padding:"9px 4px", borderRadius:10, border:`1px solid ${activeType===type?C.text:C.border}`, background:activeType===type?C.text:"none", color:activeType===type?C.bg:C.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, transition:"all 0.15s" }}>
            {p.day}<br/><span style={{ fontWeight:400, fontSize:11 }}>{p.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {prog.exercises.map(ex=><GuideCard key={ex.id} exId={ex.id}/>)}
      </div>
    </div>
  );
}

function ProgressScreen({ sessions, back }) {
  const [sel, setSel] = useState(null);
  const allExs = []; const seen = new Set();
  for(const s of sessions) for(const ex of s.exercises) if(!seen.has(ex.id) && EXERCISE_INFO[ex.id]){seen.add(ex.id);allExs.push({id:ex.id,name:EXERCISE_INFO[ex.id].friendlyName || ex.name});}
  const cid=sel||allExs[0]?.id;
  const data=sessions.filter(s=>s.exercises.some(e=>e.id===cid)).map(s=>{
    const ex=s.exercises.find(e=>e.id===cid);
    return{date:new Date(s.date).toLocaleDateString("fr",{day:"numeric",month:"short"}),reps:ex.sets.reduce((a,s)=>a+(s.reps||0),0)};
  });
  const maxR=data.length?Math.max(...data.map(d=>d.reps)):0;
  const lastR=data.at(-1)?.reps||0;
  return (
    <div style={{ maxWidth:448, margin:"0 auto", padding:"28px 16px 60px" }}>
      <button onClick={back} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:20 }}>← Retour</button>
      <div style={{ ...T.display, fontSize:"1.7rem", marginBottom:4 }}>Progression</div>
      <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:24 }}>Répétitions totales par séance</div>
      {sessions.length===0 ? (
        <div style={{ textAlign:"center", paddingTop:60 }}>
          <div style={{ ...T.display, fontSize:"2rem", color:C.border, marginBottom:12 }}>↗</div>
          <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Aucune donnée — complète ta première séance !</div>
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:10, marginBottom:18 }}>
            {allExs.map(ex=>(
              <button key={ex.id} onClick={()=>setSel(ex.id)} style={{ background:cid===ex.id?C.text:"none", color:cid===ex.id?C.bg:C.muted, border:`1px solid ${cid===ex.id?C.text:C.border}`, borderRadius:20, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, transition:"all 0.15s" }}>
                {ex.name}
              </button>
            ))}
          </div>
          <div style={{ ...card, padding:"16px", marginBottom:16 }}>
            <div style={{ ...T.label, marginBottom:14 }}>{allExs.find(e=>e.id===cid)?.name}</div>
            {data.length>1 ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={data} margin={{top:4,right:4,bottom:0,left:-20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.faint}/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:C.muted,fontFamily:"'DM Sans',sans-serif"}}/>
                  <YAxis tick={{fontSize:10,fill:C.muted,fontFamily:"'DM Sans',sans-serif"}}/>
                  <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:12}} itemStyle={{color:C.accent}}/>
                  <Line type="monotone" dataKey="reps" stroke={C.accent} strokeWidth={2} dot={{fill:C.accent,r:4,strokeWidth:0}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign:"center", padding:"24px 0", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
                {data.length===1?"Encore une séance pour voir la courbe":"Aucune donnée pour cet exercice"}
              </div>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[{val:lastR,label:"Dernière"},{val:maxR,label:"Record"},{val:data.length,label:"Séances"}].map(({val,label})=>(
              <div key={label} style={{ ...card, padding:"12px", textAlign:"center" }}>
                <div style={{ ...T.display, fontSize:"1.4rem", color:C.accent }}>{val}</div>
                <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:11, marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HistoryScreen({ sessions, back, deleteSession }) {
  const sorted=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div style={{ maxWidth:448, margin:"0 auto", padding:"28px 16px 60px" }}>
      <button onClick={back} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:20 }}>← Retour</button>
      <div style={{ ...T.display, fontSize:"1.7rem", marginBottom:4 }}>Historique</div>
      <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:24 }}>{sessions.length} séance{sessions.length!==1?"s":""} enregistrée{sessions.length!==1?"s":""}</div>
      {sorted.length===0 ? (
        <div style={{ textAlign:"center", paddingTop:60, ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Aucune séance pour l'instant.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sorted.map(s=>{
            const meta=TYPE_META[s.type];
            const totalSets=s.exercises.reduce((a,e)=>a+e.sets.length,0);
            const totalReps=s.exercises.reduce((a,e)=>a+e.sets.reduce((b,r)=>b+(r.reps||0),0),0);
            return (
              <div key={s.id} style={{ ...card, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ ...T.label, marginBottom:3 }}>{meta?.day}</div>
                    <div style={{ ...T.display, fontSize:"1.1rem" }}>{meta?.label}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ ...T.body, fontWeight:600, fontSize:14 }}>{s.duration} min</div>
                    <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>{totalSets} sér. · {totalReps} reps</div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>
                    {new Date(s.date).toLocaleDateString("fr",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                  <button onClick={() => { if(window.confirm("Supprimer cette séance ?")) deleteSession(s.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.danger, fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Supprimer</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {s.exercises.map(ex=>(<span key={ex.id} style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", background:C.faint, color:C.muted, borderRadius:20, padding:"2px 8px" }}>{ex.name}</span>))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkoutPreviewScreen({ type, back, startWorkout, todayDone }) {
  const prog = PROGRAM[type];
  return (
    <div style={{ maxWidth:448, margin:"0 auto", padding:"28px 16px 80px" }}>
      <button onClick={back} style={{ background:"none", border:"none", cursor:"pointer", ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:20 }}>← Retour</button>
      <div style={{ ...T.label, marginBottom:4 }}>{prog.day}</div>
      <div style={{ ...T.display, fontSize:"1.7rem", marginBottom:4 }}>{prog.label}</div>
      <div style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:24 }}>{prog.sub}</div>
      
      <div style={{ ...card, padding:"16px", marginBottom:24 }}>
        <div style={{ ...T.label, marginBottom:12 }}>Exercices de la séance</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {prog.exercises.map((ex, i) => {
            const info = EXERCISE_INFO[ex.id];
            return (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ ...T.body, fontSize:14, fontWeight:500 }}>{info?.friendlyName || ex.id}</span>
                <span style={{ ...T.muted, fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>{ex.sets} × {ex.reps} {ex.isTime ? "sec" : "reps"}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <button onClick={() => startWorkout(type)} style={btn(todayDone ? "accent" : "primary")}>
        {todayDone ? "Lancer quand même" : "Lancer la séance"}
      </button>
    </div>
  );
}
