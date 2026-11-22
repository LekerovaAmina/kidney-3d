import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'
import Counter from '../components/Counter.jsx'

export default function Numbers() {
  const { STATS } = useT()
  return (
    <Section id="numbers">
      <div className="grid stats">
        {STATS.map((s) => (
          <div className="card stat" key={s.label}>
            <div className="num">
              <Counter value={s.value} decimals={s.decimals} format={s.format} />
              {s.suffix && <small>{s.suffix}</small>}
            </div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
