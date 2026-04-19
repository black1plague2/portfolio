import { useState, useEffect, useRef } from 'react'
import './App.css'

/* ─── Typing Hook ─── */
function useTypingEffect(words: string[], speed = 90, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx]
    const delay = deleting ? speed / 2 : speed

    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1))
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) {
          setDeleting(false)
          setWordIdx(i => (i + 1) % words.length)
          setCharIdx(0)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return display
}

/* ─── Scroll Animation Hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ─── Data ─── */
const skills = [
  { name: 'React / TypeScript', level: 88, color: '#00f5ff' },
  { name: 'Node.js / Express', level: 80, color: '#39ff14' },
  { name: 'Python', level: 75, color: '#7c3aed' },
  { name: 'CSS / Tailwind', level: 90, color: '#ff006e' },
  { name: 'SQL / MongoDB', level: 72, color: '#ffd60a' },
  { name: 'Git & DevOps', level: 78, color: '#ff6b00' },
]

const projects = [
  {
    title: 'Project Alpha',
    desc: 'A full-stack web application with real-time features, built with React and Node.js.',
    tags: ['React', 'Node.js', 'WebSocket', 'MongoDB'],
    color: '#00f5ff',
    icon: '⚡',
  },
  {
    title: 'Project Beta',
    desc: 'ML-powered data analysis dashboard with interactive visualisations.',
    tags: ['Python', 'FastAPI', 'D3.js', 'PostgreSQL'],
    color: '#7c3aed',
    icon: '🧠',
  },
  {
    title: 'Project Gamma',
    desc: 'Mobile-first e-commerce platform with seamless checkout experience.',
    tags: ['TypeScript', 'Next.js', 'Stripe', 'Tailwind'],
    color: '#ff006e',
    icon: '🛒',
  },
]

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['Home', 'About', 'Skills', 'Projects', 'Contact']

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__brand">
        <span className="navbar__logo">GB</span>
        <span className="navbar__name">Garv Bansal</span>
      </div>
      <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
        {links.map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
              {l}
            </a>
          </li>
        ))}
      </ul>
      <button className="navbar__hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}

/* ─── Hero ─── */
function Hero() {
  const roles = ['Full-Stack Developer', 'UI / UX Enthusiast', 'Problem Solver', 'Code Craftsman']
  const typed = useTypingEffect(roles)

  return (
    <section id="home" className="hero">
      {/* Animated mesh grid */}
      <div className="hero__grid" aria-hidden />
      {/* Floating orbs */}
      <div className="hero__orb hero__orb--1" aria-hidden />
      <div className="hero__orb hero__orb--2" aria-hidden />
      <div className="hero__orb hero__orb--3" aria-hidden />

      <div className="hero__content">
        <p className="hero__greeting">👋 Hello, I'm</p>
        <h1 className="hero__name">
          Garv <span className="hero__name--accent">Bansal</span>
        </h1>
        <div className="hero__role">
          <span>{typed}</span>
          <span className="hero__cursor" aria-hidden>|</span>
        </div>
        <p className="hero__sub">
          I build beautiful, blazing-fast digital experiences that live at the intersection of
          design and engineering.
        </p>
        <div className="hero__cta">
          <a href="#projects" className="btn btn--primary">View My Work</a>
          <a href="#contact" className="btn btn--ghost">Get In Touch</a>
        </div>
        <div className="hero__socials">
          {['GitHub', 'LinkedIn', 'Twitter'].map(s => (
            <a key={s} href="#" className="social-pill">{s}</a>
          ))}
        </div>
      </div>

      <div className="hero__scroll-indicator" aria-hidden>
        <span />
      </div>
    </section>
  )
}

/* ─── About ─── */
function About() {
  const { ref, visible } = useScrollReveal()
  return (
    <section id="about" className={`section about${visible ? ' reveal--visible' : ' reveal--hidden'}`} ref={ref as React.RefObject<HTMLElement>}>
      <div className="section__inner">
        <SectionHeading label="Get to Know Me" title="About" accent="Me" />
        <div className="about__grid">
          <div className="about__avatar-wrap">
            <div className="about__avatar">
              <img src="/profile.jpg" alt="Garv Bansal" />
            </div>
            <div className="about__badge">Available for hire ✦</div>
          </div>
          <div className="about__text">
            <p>
              Hi! I'm <strong>Garv Bansal</strong>, a passionate developer who loves turning complex
              problems into elegant, user-friendly solutions. I specialise in building modern web
              applications with clean code and thoughtful design.
            </p>
            <p>
              When I'm not coding, you'll find me exploring new technologies, contributing to
              open-source, or enjoying a good cup of coffee ☕. I believe great software is built at
              the crossroads of creativity and logic.
            </p>
            <div className="about__stats">
              {[
                { val: '10+', label: 'Projects Built' },
                { val: '2+', label: 'Years Coding' },
                { val: '∞', label: 'Curiosity' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className="stat-card__val">{s.val}</span>
                  <span className="stat-card__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Skills ─── */
function Skills() {
  const { ref, visible } = useScrollReveal()
  return (
    <section id="skills" className={`section skills${visible ? ' reveal--visible' : ' reveal--hidden'}`} ref={ref as React.RefObject<HTMLElement>}>
      <div className="section__inner">
        <SectionHeading label="What I Work With" title="My" accent="Skills" />
        <div className="skills__grid">
          {skills.map((sk, i) => (
            <div key={sk.name} className="skill-card" style={{ '--delay': `${i * 80}ms` } as React.CSSProperties}>
              <div className="skill-card__header">
                <span className="skill-card__name">{sk.name}</span>
                <span className="skill-card__pct" style={{ color: sk.color }}>{sk.level}%</span>
              </div>
              <div className="skill-card__bar-bg">
                <div
                  className={`skill-card__bar${visible ? ' skill-card__bar--animate' : ''}`}
                  style={{ '--target-width': `${sk.level}%`, '--bar-color': sk.color, '--delay': `${i * 80 + 300}ms` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Projects ─── */
function Projects() {
  const { ref, visible } = useScrollReveal()
  return (
    <section id="projects" className={`section projects${visible ? ' reveal--visible' : ' reveal--hidden'}`} ref={ref as React.RefObject<HTMLElement>}>
      <div className="section__inner">
        <SectionHeading label="Things I've Built" title="Featured" accent="Projects" />
        <div className="projects__grid">
          {projects.map((p, i) => (
            <div
              key={p.title}
              className="project-card"
              style={{ '--accent': p.color, '--delay': `${i * 120}ms` } as React.CSSProperties}
            >
              <div className="project-card__icon">{p.icon}</div>
              <h3 className="project-card__title">{p.title}</h3>
              <p className="project-card__desc">{p.desc}</p>
              <div className="project-card__tags">
                {p.tags.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
              <div className="project-card__links">
                <a href="#" className="project-link">Live Demo ↗</a>
                <a href="#" className="project-link project-link--ghost">GitHub →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Contact ─── */
function Contact() {
  const { ref, visible } = useScrollReveal()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className={`section contact${visible ? ' reveal--visible' : ' reveal--hidden'}`} ref={ref as React.RefObject<HTMLElement>}>
      <div className="section__inner">
        <SectionHeading label="Let's Work Together" title="Get In" accent="Touch" />
        <div className="contact__grid">
          <div className="contact__info">
            <p className="contact__blurb">
              Have a project in mind or just want to say hi? My inbox is always open. Whether
              it's a freelance project, a full-time role, or just a chat — let's talk!
            </p>
            <div className="contact__details">
              {[
                { icon: '✉', label: 'Email', val: 'garv@example.com' },
                { icon: '📍', label: 'Location', val: 'India' },
                { icon: '💼', label: 'Status', val: 'Open to opportunities' },
              ].map(d => (
                <div key={d.label} className="contact-detail">
                  <span className="contact-detail__icon">{d.icon}</span>
                  <div>
                    <span className="contact-detail__label">{d.label}</span>
                    <span className="contact-detail__val">{d.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form className="contact__form" onSubmit={handleSubmit}>
            {sent && <div className="form-success">🎉 Message sent! I'll get back to you soon.</div>}
            <div className="form-group">
              <input
                required type="text" placeholder="Your Name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <input
                required type="email" placeholder="Your Email"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <textarea
                required rows={5} placeholder="Your Message"
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full">
              Send Message ✦
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">Garv Bansal</span>
        <p className="footer__copy">© 2026 — Built with React & ❤️</p>
      </div>
    </footer>
  )
}

/* ─── Section Heading helper ─── */
function SectionHeading({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <div className="section-heading">
      <span className="section-heading__label">{label}</span>
      <h2 className="section-heading__title">
        {title} <span className="section-heading__accent">{accent}</span>
      </h2>
      <div className="section-heading__line" />
    </div>
  )
}

/* ─── App Root ─── */
export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </div>
  )
}

