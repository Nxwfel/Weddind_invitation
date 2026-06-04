import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Fonts ─────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #f0f2eb;
      --dark:  #1b3312;
      --mid:   #4a5e43;
      --light: #8ea685;
      --accent:#d9f99d;
      --serif: 'Cormorant Garamond', Georgia, serif;
      --sans:  'Montserrat', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body, #root {
      background: var(--cream);
      color: var(--dark);
      font-family: var(--sans);
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--cream); }
    ::-webkit-scrollbar-thumb { background: var(--dark); }

    /* ── Curtain preloader ── */
    .curtain-left, .curtain-right {
      position: fixed; top: 0; width: 50%; height: 100%; z-index: 999;
      background: var(--dark);
      transition: transform 1.4s cubic-bezier(0.76, 0, 0.24, 1);
    }
    .curtain-left  { left: 0;  display:flex; align-items:center; justify-content:flex-end; }
    .curtain-right { right: 0; }
    .curtain-left.open  { transform: translateX(-100%); }
    .curtain-right.open { transform: translateX(100%); }

    .curtain-content {
      position: absolute; right: 0; transform: translateX(50%);
      display: flex; flex-direction: column; align-items: center;
      width: 280px; text-align: center; z-index: 1001;
    }

    /* ── SVG draw animation ── */
    @keyframes draw { to { stroke-dashoffset: 0; } }
    .draw-anim {
      stroke-dasharray: 800;
      stroke-dashoffset: 800;
      animation: draw 3s cubic-bezier(.25,1,.5,1) forwards;
    }
    .draw-anim-2 { animation-delay: .5s; }

    /* ── Fade-in on reveal ── */
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 1s ease, transform 1s ease; }
    .revealed { opacity: 1; transform: translateY(0); }

    /* ── Oval scribble button ── */
    .oval-btn {
      position: relative; background: transparent; border: none;
      padding: 12px 40px; cursor: pointer;
      font-family: var(--sans); font-size: 11px; font-weight: 500;
      letter-spacing: .35em; text-transform: uppercase; color: var(--dark);
    }
    .oval-btn svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .oval-btn:hover .oval-path { stroke-dashoffset: 0; }
    .oval-btn .oval-path {
      fill: none; stroke: var(--dark); stroke-width: .9;
      stroke-dasharray: 600; stroke-dashoffset: 600;
      transition: stroke-dashoffset 0.6s ease;
    }
    .oval-btn-light .oval-path { stroke: var(--accent); }
    .oval-btn-light { color: var(--accent); }

    /* ── Nav link hover ── */
    .nav-link {
      font-size: 10px; letter-spacing: .25em; text-transform: uppercase;
      color: var(--mid); text-decoration: none;
      transition: color .25s;
    }
    .nav-link:hover { color: var(--dark); }

    /* ── Monogram badge ── */
    .monogram {
      width: 52px; height: 64px; border-radius: 50% / 60%;
      border: 1px solid rgba(27,51,18,.4);
      display: flex; align-items: center; justify-content: center;
      position: relative; flex-shrink: 0;
    }
    .monogram::before {
      content:''; position:absolute; inset:3px; border-radius: 50%/60%;
      border: 1px dashed rgba(27,51,18,.15);
    }
    .monogram-lg {
      width: 80px; height: 96px; border-radius: 50% / 60%;
      border: 1.5px solid rgba(240,242,235,.5);
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Hero images ── */
    .hero-img { width:100%; height:100%; object-fit:cover; filter:grayscale(1); }
    .hero-img-wrap {
      overflow: hidden;
      border: 1px solid rgba(27,51,18,.1);
    }

    /* ── Photo fan ── */
    @keyframes fanIn {
      from { opacity:0; transform: rotate(var(--rot)) translateY(60px); }
      to   { opacity:1; transform: rotate(var(--rot)) translateY(0); }
    }
    .fan-photo {
      position: absolute; bottom: 0; left: 50%; transform-origin: bottom center;
      animation: fanIn .8s ease both;
    }

    /* ── Timeline cards ── */
    .timeline-card {
      background: var(--dark);
      display:flex; flex-direction:column;
      align-items:center; padding: 28px 16px 24px;
      transition: transform .3s ease;
    }
    .timeline-card:hover { transform: translateY(-6px); }

    /* ── Event sticky cards ── */
    .event-card {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      background: var(--cream); border: 1px solid rgba(27,51,18,.12);
      box-shadow: 0 8px 40px rgba(27,51,18,.06);
      transition: box-shadow .3s ease;
    }
    .event-card:hover { box-shadow: 0 16px 60px rgba(27,51,18,.1); }
    .event-card img { width:100%; height:100%; object-fit:cover; filter:grayscale(1) brightness(.96); display:block; }
    .event-img-wrap { overflow:hidden; aspect-ratio: 4/5; }
    .event-img-wrap img { transition: transform .7s ease; }
    .event-img-wrap:hover img { transform: scale(1.05); }

    /* ── Countdown ── */
    .count-digit {
      font-family: var(--serif); font-size: clamp(3.5rem,9vw,7rem);
      font-weight: 300; color: var(--dark); line-height: 1; letter-spacing: .04em;
    }

    /* ── Footer grid ── */
    .footer-cell {
      padding: 20px; display:flex; align-items:center; justify-content:center;
      font-size: 10px; letter-spacing:.2em; text-transform:uppercase;
      color: rgba(240,242,235,.35); font-weight:300;
      border-right: 1px solid rgba(255,255,255,.08);
    }
    .footer-cell:last-child { border-right: none; }

    /* ── Pulse ── */
    @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
    .pulse { animation: pulse 2s infinite; }

    /* ── Contact icons ── */
    .contact-icon {
      width: 46px; height: 46px; border-radius: 50%;
      border: 1px solid rgba(240,242,235,.25);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }

    /* ── Section transitions ── */
    .section-reveal { opacity:0; transform:translateY(40px); transition: opacity .9s ease, transform .9s ease; }
    .section-visible { opacity:1; transform:translateY(0); }

    @media (max-width: 768px) {
      .event-card { grid-template-columns: 1fr; }
      .event-img-wrap { aspect-ratio: 3/2; }
      .hero-cols { display: none; }
      .timeline-grid { grid-template-columns: 1fr 1fr !important; }
    }
    @media (max-width: 500px) {
      .timeline-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ─── Oval Button ───────────────────────────────────────────── */
const OvalBtn = ({ children, light = false, onClick, style = {} }) => (
  <button className={`oval-btn ${light ? "oval-btn-light" : ""}`} onClick={onClick} style={style}>
    <svg viewBox="0 0 200 54" preserveAspectRatio="none">
      <ellipse className="oval-path" cx="100" cy="27" rx="96" ry="23" />
      <ellipse className="oval-path" cx="100" cy="27" rx="90" ry="18"
        style={{ strokeDashoffset: 600, transitionDelay: ".1s" }} />
    </svg>
    {children}
  </button>
);

/* ─── Section Reveal Hook ───────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ─── Countdown Hook ────────────────────────────────────────── */
const useCountdown = (target) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
};

/* ─── SECTION: Preloader ────────────────────────────────────── */
const Preloader = ({ onOpen, bride, groom }) => (
  <div>
    <div className="curtain-left" id="cl">
      <div className="curtain-content">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none"
          stroke="#d9f99d" strokeWidth=".7" strokeLinecap="round">
          <ellipse className="draw-anim" cx="50" cy="52" rx="30" ry="36" />
          <path className="draw-anim draw-anim-2" d="M50 22 C42 36 58 36 50 82" />
        </svg>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: ".3em",
            textTransform: "uppercase", color: "#f0f2eb" }}>
            {bride} &amp; {groom}
          </div>
          <div style={{ fontSize: 9, letterSpacing: ".3em", color: "var(--light)",
            textTransform: "uppercase", marginTop: 6 }}>
            June 22 · 2026
          </div>
        </div>
        <button onClick={onOpen} className="pulse"
          style={{ marginTop: 28, fontFamily: "var(--sans)", fontSize: 9,
            letterSpacing: ".5em", textTransform: "uppercase", color: "var(--light)",
            background: "none", border: "none", cursor: "pointer" }}>
          Click to Open
        </button>
      </div>
    </div>
    <div className="curtain-right" id="cr" />
  </div>
);

/* ─── SECTION: Hero ─────────────────────────────────────────── */
const Hero = ({ revealed, bride, groom, date }) => {
  const { scrollY } = useScroll();
  const leftY = useTransform(scrollY, [0, 1000], [0, 120]);
  const rightY = useTransform(scrollY, [0, 1000], [40, -80]);

  return (
    <header id="home" style={{ position: "relative", minHeight: "100vh",
      padding: "28px 48px 0", display: "flex", flexDirection: "column",
      justifyContent: "space-between", overflow: "hidden", background: "var(--cream)" }}>

      {/* Nav */}
      <nav className={`reveal ${revealed ? "revealed" : ""}`}
        style={{ transitionDelay: ".5s", display: "flex",
          justifyContent: "space-between", alignItems: "flex-start", zIndex: 20 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500,
          letterSpacing: ".08em", lineHeight: 1.2, textTransform: "uppercase" }}>
          {bride.charAt(0)} &amp;<br />{groom.charAt(0)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)",
          gap: "8px 32px", alignItems: "center" }}>
          {[["HOME","#home"],["COUPLE","#couple"],["WEDDING BLOG","#blog"],
            ["OUR STORY","#story"],["OUR EVENTS","#events"],["RSVP","#rsvp"]]
            .map(([label, href]) => (
              <a key={label} href={href} className="nav-link">{label}</a>
            ))}
        </div>
      </nav>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr",
        gap: 16, alignItems: "center", flex: 1, padding: "40px 0 20px", position: "relative" }}>

        {/* Left image */}
        <motion.div className="hero-cols" style={{ y: leftY }}>
          <div className="hero-img-wrap" style={{ aspectRatio: "4/5", width: "100%" }}>
            <img className="hero-img"
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600"
              alt="Ring" />
          </div>
        </motion.div>

        {/* Center typography */}
        <div className={`reveal ${revealed ? "revealed" : ""}`}
          style={{ transitionDelay: ".7s", display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", zIndex: 20, padding: "0 24px" }}>

          {/* Monogram oval */}
          <div className="monogram" style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 18, letterSpacing: ".1em", lineHeight: 1 }}>
              {bride.charAt(0)}<sub style={{ fontSize: 9, fontFamily: "var(--sans)", position: "relative", left: -1, top: 3 }}>{groom.charAt(0)}</sub>
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.5rem,8vw,7rem)",
            fontWeight: 400, textTransform: "uppercase", lineHeight: .9,
            letterSpacing: ".02em", color: "var(--dark)", marginBottom: 32 }}>
            {bride} &amp;<br />{groom}
          </h1>

          <div style={{ display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, marginBottom: 32 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 20,
              letterSpacing: ".18em", fontWeight: 300 }}>
              {date.toLocaleDateString("en-US", { day: "numeric", month: "long" }).toUpperCase()}
            </span>
            <span style={{ fontSize: 9, letterSpacing: ".3em",
              color: "var(--mid)", textTransform: "uppercase" }}>
              {date.getFullYear()}, {date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}
            </span>
          </div>

          <OvalBtn onClick={() => document.getElementById("rsvp").scrollIntoView({ behavior: "smooth" })}>
            RSVP Now
          </OvalBtn>
        </div>

        {/* Right image */}
        <motion.div className="hero-cols" style={{ y: rightY, alignSelf: "flex-end" }}>
          <div className="hero-img-wrap" style={{ aspectRatio: "4/5", width: "100%" }}>
            <img className="hero-img"
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"
              alt="Couple" />
          </div>
        </motion.div>
      </div>

      {/* Subtle border bottom */}
      <div style={{ height: 1, background: "rgba(27,51,18,.06)" }} />
    </header>
  );
};

/* ─── SECTION: Dark hero banner (photo fan) ─────────────────── */
const DarkBanner = ({ bride, groom, date, location }) => {
  const [ref, visible] = useReveal();
  const photos = [
    { url: "https://images.unsplash.com/photo-1595814432286-751bbf7e2d5a?q=80&w=400", rot: -22, delay: 0 },
    { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=400", rot: -11, delay: .1 },
    { url: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=400", rot: 0, delay: .2 },
    { url: "https://images.unsplash.com/photo-1464699908537-0954e50791ee?q=80&w=400", rot: 11, delay: .3 },
    { url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=400", rot: 22, delay: .4 },
  ];
  return (
    <section ref={ref} style={{ background: "var(--dark)", padding: "70px 48px 0",
      overflow: "hidden", position: "relative" }}>

      {/* Monogram */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div className="monogram-lg">
          <span style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#f0f2eb",
            letterSpacing: ".15em" }}>
            {bride.charAt(0)}<sub style={{ fontSize: 11, fontFamily: "var(--sans)", position: "relative", left: -1 }}>{groom.charAt(0)}</sub>
          </span>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--sans)", fontSize: 10, letterSpacing: ".3em",
          color: "var(--light)", textTransform: "uppercase", marginBottom: 20 }}>
          With Love,
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,8vw,6.5rem)",
          fontWeight: 400, color: "var(--accent)", textTransform: "uppercase",
          lineHeight: .88, letterSpacing: ".01em" }}>
          {bride} &amp;<br />{groom}
        </h2>
        <div style={{ marginTop: 28, fontFamily: "var(--sans)", fontSize: 12,
          letterSpacing: ".15em", color: "rgba(240,242,235,.5)" }}>
          {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  {location.split(",")[0]}
        </div>
      </div>

      {/* Fan of photos */}
      <div style={{ position: "relative", height: 380, marginTop: 40 }}>
        {photos.map((p, i) => (
          <motion.div key={i} className="fan-photo"
            initial={{ y: 80, rotate: 0 }}
            whileInView={{ y: 0, rotate: p.rot }}
            transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            style={{
              width: 200, marginLeft: -100,
              border: "6px solid white",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}>
            <img src={p.url} alt=""
              style={{ width: "100%", aspectRatio: "3/4",
                objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ─── SECTION: Meet the Couple ──────────────────────────────── */
const MeetCouple = ({ bride, groom }) => {
  const [ref, visible] = useReveal();
  return (
    <section id="couple" ref={ref} style={{ background: "var(--dark)", padding: "80px 48px 60px" }}>
      <div className={`section-reveal ${visible ? "section-visible" : ""}`}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,9vw,7.5rem)",
          fontWeight: 300, color: "var(--accent)", textTransform: "uppercase",
          lineHeight: .88, textAlign: "center", marginBottom: 56 }}>
          Meet the<br />Bride &amp; Groom
        </h2>

        {/* Couple bios */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr",
          gap: "0 48px", maxWidth: 800, margin: "0 auto 56px", alignItems: "start" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, lineHeight: 1.8,
              color: "rgba(240,242,235,.65)", fontWeight: 300, marginBottom: 20 }}>
              A creative soul with a love for art, coffee, and quiet mornings.
              {bride} believes in meaningful moments and the magic of love.
            </p>
            <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
              letterSpacing: ".2em", textTransform: "uppercase", color: "#f0f2eb" }}>
              {bride} 
            </div>
            <div style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--light)",
              marginTop: 4, textTransform: "uppercase" }}>Bride</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.1)", width: 1, alignSelf: "stretch" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, lineHeight: 1.8,
              color: "rgba(240,242,235,.65)", fontWeight: 300, marginBottom: 20 }}>
              An adventure seeker with a kind heart and endless optimism.
              Michael is grateful every day for the love they share.
            </p>
            <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
              letterSpacing: ".2em", textTransform: "uppercase", color: "#f0f2eb" }}>
               {groom}
            </div>
            <div style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--light)",
              marginTop: 4, textTransform: "uppercase" }}>Groom</div>
          </div>
        </div>

        {/* Quote */}
        <div style={{ textAlign: "center", marginBottom: 56, borderTop: "1px solid rgba(255,255,255,.08)",
          paddingTop: 48 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem,3vw,2.2rem)",
            fontStyle: "italic", color: "var(--accent)", fontWeight: 300, letterSpacing: ".02em" }}>
            "And so the adventure begins."
          </div>
          {/* Rings SVG */}
          <motion.svg width="160" height="80" viewBox="0 0 160 80" fill="none"
            stroke="rgba(240,242,235,.25)" strokeWidth=".8" strokeLinecap="round"
            style={{ marginTop: 20 }}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.5 }}>
            <circle cx="60" cy="50" r="22" />
            <circle cx="100" cy="50" r="22" />
            <path d="M56 30 C60 18 70 18 74 30" strokeWidth=".5" />
            <polygon points="76,16 80,22 84,16 80,10" fill="rgba(240,242,235,.25)" stroke="none" />
            <path d="M100 50 C112 64 130 46 148 56" strokeLinecap="round" />
            <path d="M24 55 C30 60 38 58 42 54" strokeLinecap="round" />
          </motion.svg>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 40, gap: 0 }}>
          {[
            ["Premier Date", "13 Juin"],
            ["Deuxième Date", "14 Juin"],
          ].map(([label, value], i) => (
            <div key={i} style={{ textAlign: "center", padding: "0 16px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
              <div style={{ fontSize: 9, letterSpacing: ".3em", color: "var(--light)",
                textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,3rem)",
                fontWeight: 300, color: "#f0f2eb", letterSpacing: ".04em" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── SECTION: Our Journey ──────────────────────────────────── */
const OurJourney = () => {
  const [ref, visible] = useReveal();
  return (
    <section id="story" ref={ref} style={{ background: "var(--cream)",
      padding: "100px 48px 80px", textAlign: "center", overflow: "hidden" }}>
      <div className={`section-reveal ${visible ? "section-visible" : ""}`}>
        <div style={{ fontSize: 9, letterSpacing: ".4em", color: "var(--mid)",
          textTransform: "uppercase", marginBottom: 20 }}>OUR JOURNEY</div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem,8vw,7rem)",
          fontWeight: 400, color: "var(--dark)", textTransform: "uppercase",
          lineHeight: .88, letterSpacing: ".01em", maxWidth: 900, margin: "0 auto 56px" }}>
          Our Journey Together From First Meeting to Forever
        </h2>

        {/* Story image */}
        <div style={{ maxWidth: 580, margin: "0 auto", overflow: "hidden",
          border: "1px solid rgba(27,51,18,.08)" }}>
          <motion.img 
            initial={{ scale: 1.1, y: 30 }}
            whileInView={{ scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
            src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=900"
            alt="Couple story"
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover",
              filter: "grayscale(.3)", display: "block",
              transition: "transform .7s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
        </div>
      </div>
    </section>
  );
};

/* ─── SECTION: Timeline ─────────────────────────────────────── */
const Timeline = () => {
  const [ref, visible] = useReveal();
  const items = [
    { time: "4:00 PM", title: "CEREMONY BEGINS",
      desc: "Please arrive 15 minutes early to be seated comfortably.",
      icon: <CeremonyIcon /> },
    { time: "5:00 PM", title: "COCKTAIL HOUR",
      desc: "Enjoy drinks and light bites while we take photos.",
      icon: <CocktailIcon /> },
    { time: "6:30 PM", title: "RECEPTION",
      desc: "Dinner is served, followed by toasts and celebration.",
      icon: <DinnerIcon /> },
    { time: "8:00 PM", title: "CELEBRATION",
      desc: "Join us on the dance floor as the party continues.",
      icon: <CelebrationIcon /> },
  ];
  return (
    <section ref={ref} style={{ background: "var(--cream)", padding: "0 48px 80px" }}>
      <div className={`section-reveal ${visible ? "section-visible" : ""}`}>
        <div className="timeline-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {items.map((item, i) => (
            <div key={i} className="timeline-card">
              <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                fontWeight: 300, color: "var(--accent)", letterSpacing: ".04em",
                marginBottom: 16 }}>{item.time}</div>
              <div style={{ width: "60%", height: 1, background: "rgba(217,249,157,.2)",
                marginBottom: 28 }} />
              <div style={{ marginBottom: 20, opacity: .9 }}>{item.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".25em",
                textTransform: "uppercase", color: "var(--accent)",
                marginBottom: 12, textAlign: "center" }}>{item.title}</div>
              <div style={{ fontSize: 11, fontWeight: 300, color: "rgba(240,242,235,.6)",
                lineHeight: 1.7, textAlign: "center", maxWidth: 200 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── SVG Icons ─────────────────────────────────────────────── */
const CeremonyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
    stroke="var(--accent)" strokeWidth=".8" strokeLinecap="round">
    <polygon points="32,14 48,44 16,44" />
    <circle cx="32" cy="44" r="5" />
    <line x1="28" y1="20" x2="22" y2="16" />
    <line x1="22" y1="16" x2="19" y2="20" />
    <circle cx="20" cy="14" r="2" />
    <line x1="36" y1="20" x2="42" y2="16" />
    <line x1="42" y1="16" x2="45" y2="20" />
    <circle cx="44" cy="14" r="2" />
  </svg>
);
const CocktailIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
    stroke="var(--accent)" strokeWidth=".8" strokeLinecap="round">
    <path d="M22 14 L32 30 L42 14 Z" />
    <path d="M22 14 H42" />
    <line x1="32" y1="30" x2="32" y2="48" />
    <line x1="24" y1="48" x2="40" y2="48" />
    <path d="M34 22 L38 26" />
    <circle cx="37" cy="20" r="2.5" />
  </svg>
);
const DinnerIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
    stroke="var(--accent)" strokeWidth=".8" strokeLinecap="round">
    <circle cx="32" cy="32" r="18" />
    <circle cx="32" cy="32" r="12" />
    <line x1="16" y1="32" x2="14" y2="32" />
    <line x1="48" y1="32" x2="50" y2="32" />
    <path d="M30,28 C30,32 34,32 34,28" />
    <circle cx="32" cy="32" r="2" fill="var(--accent)" />
  </svg>
);
const CelebrationIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
    stroke="var(--accent)" strokeWidth=".8" strokeLinecap="round">
    <path d="M20 44 C22 32 38 32 40 20" />
    <path d="M28 44 C30 32 42 28 44 16" />
    <path d="M36 44 C36 36 48 28 46 16" />
    <path d="M40 16 C42 12 44 16 42 18" />
    <path d="M44 16 C46 12 48 16 46 18" />
    <path d="M20 44 H44" />
  </svg>
);

/* ─── SECTION: Events (GSAP Pinned Stack) ───────────────────── */
const Events = ({ date, venue, location }) => {
  const containerRef = useRef(null);

  const cards = [
    {
      img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=700",
      label: `${date.getFullYear()}, ${date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}`,
      title: date.toLocaleDateString("en-US", { day: "numeric", month: "long" }).toUpperCase(),
      subtitle: "WEDDING CEREMONY",
      desc: `${venue}, ${location}`,
      imgRight: false,
      z: 10,
    },
    {
      img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=700",
      label: venue.toUpperCase(),
      title: "5:30 PM",
      subtitle: "WEDDING RECEPTION",
      desc: "Dinner, music, and dancing to follow the ceremony.",
      imgRight: true,
      z: 20,
    },
    {
      img: "https://images.unsplash.com/photo-1584395630827-860eee694d7b?q=80&w=700",
      label: "",
      title: "DRESS CODE",
      subtitle: "EVENING FORMAL",
      desc: "We invite you to dress in elegant evening attire and celebrate with us in style.",
      imgRight: false,
      z: 30,
    },
  ];

  useGSAP(() => {
    const cardElements = gsap.utils.toArray(".gsap-event-card");
    if (cardElements.length === 0) return;

    // We pin the container, and scrub-animate the cards up
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${cardElements.length * 100}%`,
        scrub: 1,
        pin: true,
      }
    });

    cardElements.forEach((card, i) => {
      if (i > 0) {
        gsap.set(card, { yPercent: 100 }); // start fully off-screen bottom
        tl.to(card, {
          yPercent: 0, // completely overlap the previous card
          duration: 1,
          ease: "none"
        });
      }
    });
  }, { scope: containerRef });

  return (
    <div style={{ background: "var(--cream)" }}>
      {/* Header Section - completely separate from the pinned cards */}
      <section style={{ padding: "100px 24px 60px", textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: ".4em", color: "var(--mid)",
          textTransform: "uppercase", marginBottom: 20 }}>THE BIG DAY</div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,6vw,5.5rem)",
          fontWeight: 400, color: "var(--dark)", textTransform: "uppercase",
          lineHeight: .9, letterSpacing: ".01em" }}>
          Everything you need to know for our celebration.
        </h2>
      </section>

      {/* Stacked event cards Section - Pinned and 100vh */}
      <section id="events" ref={containerRef}
        style={{ height: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
        
        {cards.map((c, i) => (
          <div key={i} className="gsap-event-card"
            style={{ 
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              zIndex: c.z, background: "var(--cream)", 
              boxShadow: i > 0 ? "0 -20px 50px rgba(27,51,18,0.15)" : "none",
              borderTop: i > 0 ? "1px solid rgba(27,51,18,.05)" : "none",
              display: "grid", gridTemplateColumns: "1fr 1fr" 
            }}>

            {/* Image */}
            <div className="event-img-wrap" style={{ order: c.imgRight ? 2 : 1, height: "100%" }}>
              <img src={c.img} alt={c.subtitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Text */}
            <div style={{ order: c.imgRight ? 1 : 2, height: "100%",
              padding: "48px clamp(24px, 5vw, 60px)", display: "flex", flexDirection: "column",
              justifyContent: "center", background: "var(--cream)" }}>
              {c.label && (
                <div style={{ fontSize: 9, letterSpacing: ".3em", color: "var(--mid)",
                  textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
              )}
              <div style={{ fontFamily: "var(--serif)",
                fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 400,
                textTransform: "uppercase", letterSpacing: ".02em",
                color: "var(--dark)", lineHeight: 1, marginBottom: 16 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".25em",
                textTransform: "uppercase", color: "var(--dark)", marginBottom: 8 }}>
                {c.subtitle}
              </div>
              <div style={{ fontSize: 12, fontWeight: 300, color: "var(--mid)",
                lineHeight: 1.7, maxWidth: 320, marginBottom: 32 }}>
                {c.desc}
              </div>
              <div>
                <OvalBtn onClick={() => document.getElementById("rsvp").scrollIntoView({ behavior: "smooth" })}>
                  RSVP Now
                </OvalBtn>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ─── SECTION: Countdown ────────────────────────────────────── */
const Countdown = ({ date, bride, groom, hashtag, location }) => {
  const [ref, visible] = useReveal();
  const t = useCountdown(date);
  const pad = n => String(n).padStart(2, "0");

  return (
    <section id="rsvp" ref={ref} style={{ background: "var(--cream)",
      padding: "80px 48px 0", position: "relative", overflow: "hidden" }}>

      {/* Floral watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-55%) scale(.9)", opacity: .12, pointerEvents: "none" }}>
        <svg width="280" height="380" viewBox="0 0 120 200" fill="none"
          stroke="var(--dark)" strokeWidth=".5" strokeLinecap="round">
          <path d="M60,195 Q55,130 62,25" />
          <path d="M60,140 Q38,112 47,98" />
          <path d="M61,104 Q87,82 72,68" />
          <path d="M59,74 Q30,52 44,38" />
          <circle cx="47" cy="98" r="2" fill="var(--dark)" />
          <circle cx="72" cy="68" r="2" fill="var(--dark)" />
          <circle cx="44" cy="38" r="2" fill="var(--dark)" />
          <circle cx="62" cy="25" r="1.5" fill="var(--dark)" />
          {/* Blossoms */}
          {[[47,98],[72,68],[44,38]].map(([cx,cy],i) => (
            [0,60,120,180,240,300].map(a => (
              <ellipse key={`${i}-${a}`}
                cx={cx + 7*Math.cos(a*Math.PI/180)}
                cy={cy + 7*Math.sin(a*Math.PI/180)}
                rx="3" ry="5"
                transform={`rotate(${a},${cx + 7*Math.cos(a*Math.PI/180)},${cy + 7*Math.sin(a*Math.PI/180)})`}
                fill="rgba(27,51,18,.2)" stroke="none" />
            ))
          ))}
        </svg>
      </div>

      <div className={`section-reveal ${visible ? "section-visible" : ""}`}
        style={{ position: "relative", zIndex: 10 }}>

        {/* Digit row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          gap: "clamp(12px,3vw,40px)", marginBottom: 32 }}>
          {[
            [pad(t.d), "DAYS"],
            [pad(t.h), "HOURS"],
            [pad(t.m), "MINS"],
            [pad(t.s), "SECS"],
          ].map(([val, label], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center",
              gap: "clamp(12px,3vw,40px)" }}>
              {i > 0 && (
                <span className="count-digit"
                  style={{ opacity: .3, fontSize: "clamp(2rem,5vw,4rem)", paddingBottom: 20 }}>:</span>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="count-digit">{val}</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: 9, fontWeight: 500,
                  letterSpacing: ".25em", textTransform: "uppercase",
                  color: "var(--mid)", marginTop: 8 }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 64 }}>
          <div style={{ background: "var(--accent)", padding: "10px 36px" }}>
            <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: ".4em",
              textTransform: "uppercase", color: "var(--dark)", whiteSpace: "nowrap" }}>
              COUNTING DOWN TO "I DO"
            </span>
          </div>
        </div>

        {/* Scroll up button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <OvalBtn onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            SCROLL UP
          </OvalBtn>
        </div>

        {/* Contact */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48,
          marginBottom: 64, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="contact-icon"
              style={{ background: "var(--dark)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 13.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013.4 2.68h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 10.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <span style={{ fontSize: 13, letterSpacing: ".08em", color: "var(--mid)" }}>
              (2346)-123-4567
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="contact-icon" style={{ background: "var(--dark)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span style={{ fontSize: 13, letterSpacing: ".08em", color: "var(--mid)" }}>
              saraalderson@mail.com
            </span>
          </div>
        </div>
      </div>

      {/* Dark footer */}
      <div style={{ background: "var(--dark)", display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        {[
          `${bride.charAt(0)} & ${groom.charAt(0)} ${date.getFullYear()}`,
          hashtag,
          "DESIGN & CO",
        ].map((text, i) => (
          <div key={i} className="footer-cell">{text}</div>
        ))}
      </div>

      {/* Copyright */}
      <div style={{ background: "var(--dark)", textAlign: "center",
        padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <span style={{ fontSize: 9, letterSpacing: ".25em", textTransform: "uppercase",
          color: "rgba(240,242,235,.2)" }}>
          COPYRIGHT 2026. ALL RIGHTS RESERVED.
        </span>
      </div>
    </section>
  );
};

/* ─── ROOT ──────────────────────────────────────────────────── */
export default function WeddingInvitation({ guest, event }) {
  const [revealed, setRevealed] = useState(false);
  
  const bride = event?.bride_name || "";
  const groom = event?.groom_name || "Mohammed Kendousi";
  const eventDate = useMemo(() => event?.event_date ? new Date(event.event_date) : new Date("2026-06-22T16:00:00"), [event?.event_date]);
  const venue = "Salle des fêtes Tahri Mohammed University ";
  const location = "Béchar";
  const hashtag = `#${bride.toUpperCase()}AND${groom.toUpperCase()}`;

  const handleOpen = () => {
    const cl = document.getElementById("cl");
    const cr = document.getElementById("cr");
    if (cl) cl.classList.add("open");
    if (cr) cr.classList.add("open");
    setTimeout(() => setRevealed(true), 200);
  };

  useEffect(() => {
    if (!revealed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [revealed]);

  return (
    <>
      <GlobalStyles />
      <Preloader onOpen={handleOpen} bride={bride} groom={groom} />

      <div style={revealed ? {} : { height: "100vh", overflow: "hidden" }}>
        <Hero revealed={revealed} bride={bride} groom={groom} date={eventDate} />
        <DarkBanner bride={bride} groom={groom} date={eventDate} location={location} />
        <MeetCouple bride={bride} groom={groom} />
        <OurJourney />
        <Timeline />
        <Events date={eventDate} venue={venue} location={location} />
        <Countdown date={eventDate} bride={bride} groom={groom} hashtag={hashtag} location={location} />
      </div>
    </>
  );
}