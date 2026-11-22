import { useState } from 'react'
import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'
import Counter from '../components/Counter.jsx'

export function Diseases() {
  const { DISEASES, ui } = useT()
  const D = ui.diseases
  const [id, setId] = useState(DISEASES[0].id)
  const d = DISEASES.find((x) => x.id === id)
  return (
    <Section id="diseases">
      <div className="ckd-banner">
        {D.banner.map(([v, suf, txt]) => (
          <div className="card" key={v}><b><Counter value={Number(v)} />{suf}</b>{txt}</div>
        ))}
      </div>
      <div className="disease-tabs">
        {DISEASES.map((x) => (
          <button key={x.id} className={x.id === id ? 'active' : ''} onClick={() => setId(x.id)}>{x.name}</button>
        ))}
      </div>
      <div className="disease" key={d.id}>
        <div className="card">
          <h3>{d.name}</h3>
          <p style={{ color: 'var(--muted)' }}>{d.about}</p>
        </div>
        <div className="card">
          <h4>{D.symptoms}</h4>
          <ul>{d.symptoms.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="card">
          <h4>{D.prevent}</h4>
          <ul>{d.prevent.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
      <div className="alert">
        <span style={{ fontSize: 24 }}>⚠️</span>
        {D.alert}
      </div>
    </Section>
  )
}

export function History() {
  const { TIMELINE, ui } = useT()
  const H = ui.history
  return (
    <Section id="history">
      <div className="timeline">
        {TIMELINE.map(([y, t]) => (
          <div className="tl" key={y}>
            <div className="year">{y}</div>
            <p>{t}</p>
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 20 }}>
        <div className="card">
          <h3>{H.dialysis[0]}</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>{H.dialysis[1]}</p>
        </div>
        <div className="card">
          <h3>{H.transplant[0]}</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>{H.transplant[1]}</p>
        </div>
      </div>
    </Section>
  )
}

export function Care() {
  const { TIPS } = useT()
  return (
    <Section id="care">
      <div className="grid tips">
        {TIPS.map(([e, t, d]) => (
          <div className="card tip" key={t}>
            <div className="e">{e}</div>
            <div><h3>{t}</h3><p>{d}</p></div>
          </div>
        ))}
      </div>
    </Section>
  )
}
