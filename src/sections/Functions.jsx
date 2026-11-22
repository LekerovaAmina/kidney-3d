import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'

export function Functions() {
  const { FUNCTIONS } = useT()
  return (
    <Section id="functions">
      <div className="grid funcs">
        {FUNCTIONS.map(([ico, c, t, d]) => (
          <div className="card func" key={t}>
            <div className="ico" style={{ background: c + '26' }}>{ico}</div>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function Regulation() {
  const { RAAS, HORMONES } = useT()
  return (
    <Section id="regulation">
      <div className="raas">
        {RAAS.map(([t, d], i) => (
          <div className="card" key={t} style={{ animation: `fadeUp .6s ${i * 0.15}s both` }}>
            <h4>{i + 1}. {t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <div className="grid hormones">
        {HORMONES.map((h) => (
          <div className="card" key={h.name} style={{ borderTop: `3px solid ${h.color}` }}>
            <div className="part-kicker" style={{ color: h.color }}>{h.who}</div>
            <h3>{h.name}</h3>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 15 }}>{h.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function BloodSupply() {
  const { BLOOD_CHAIN } = useT()
  const glom = 7 // «Клубочек / Шумақ» — 8-й шаг цепочки
  return (
    <Section id="blood">
      <div className="chain">
        {BLOOD_CHAIN.map(([t, s], i) => {
          const venous = i > glom + 2
          const color = venous ? 'var(--blue)' : 'var(--red2)'
          return (
            <div className="chain-item" key={t}>
              <div className="chain-box" style={{ borderColor: i === glom ? 'var(--gold)' : undefined, boxShadow: `inset 3px 0 0 ${color}` }}>
                {t}<small>{s}</small>
              </div>
              {i < BLOOD_CHAIN.length - 1 && <div className="chain-arrow" style={{ color }} />}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
