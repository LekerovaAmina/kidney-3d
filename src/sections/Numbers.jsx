import Section from '../components/Section.jsx'
import Counter from '../components/Counter.jsx'
import { STATS } from '../data/content.js'

export default function Numbers() {
  return (
    <Section id="numbers" kicker="В цифрах" title="Почка в цифрах"
      lead="Небольшой орган размером с кулак выполняет колоссальную работу — каждую минуту, всю жизнь.">
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
