import { useEffect, useState } from 'react'
import { NAV } from '../data/content.js'

export const KidneyIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M38 6c-14 0-26 12-26 27s10 25 22 25c9 0 14-6 14-12 0-5-5-7-5-13s6-8 6-14C49 12 45 6 38 6z" fill="#e2503f" />
    <path d="M35 30c-4 0-6 3-6 6" stroke="#f2c766" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
)

export default function Nav() {
  const [active, setActive] = useState('model')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      setProgress(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight))
      let cur = NAV[0][0]
      for (const [id] of NAV) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 140) cur = id
      }
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.querySelector(`.nav-links a[href="#${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])
  return (
    <nav className="nav">
      <a className="brand" href="#model"><KidneyIcon /> Почка</a>
      <div className="nav-links">
        {NAV.map(([id, label]) => (
          <a key={id} href={'#' + id} className={active === id ? 'active' : ''}>{label}</a>
        ))}
      </div>
      <div className="progress" style={{ width: progress * 100 + '%' }} />
    </nav>
  )
}
