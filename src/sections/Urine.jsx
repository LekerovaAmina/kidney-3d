import Section from '../components/Section.jsx'
import { useInView } from '../components/hooks.js'
import { STAGES, URINE_TABLE } from '../data/content.js'

export default function Urine() {
  const [ref, inView] = useInView(0.3)
  return (
    <Section id="urine" kicker="Физиология" title="Как образуется моча"
      lead="Три процесса в нефроне превращают кровь в мочу: фильтрация, обратное всасывание (реабсорбция) и секреция.">
      <div className="grid stages">
        {STAGES.map((s) => (
          <div className="card stage" key={s.n}>
            <div className="big">{s.n}</div>
            <span className="tag" style={{ background: s.color + '33', color: s.color }}>{s.tag}</span>
            <h3>{s.where}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>

      <div className="card funnel" ref={ref}>
        <div className="vol">
          <div className="tank"><div className="fill" style={{ height: inView ? '100%' : 0, background: 'linear-gradient(#f7e7a0, #e8c76b)' }} /></div>
          <b>180 л</b><span>первичной мочи за сутки</span>
        </div>
        <div className="arrow-mid"><span className="big">→</span>99% возвращается<br />в кровь</div>
        <div className="vol">
          <div className="tank"><div className="fill" style={{ height: inView ? '0.9%' : 0, minHeight: inView ? 6 : 0, background: 'linear-gradient(#ffe28a, #e0a93a)' }} /></div>
          <b>~1,5 л</b><span>конечной мочи за сутки</span>
        </div>
      </div>

      <table className="cmp">
        <thead><tr><th>Вещество</th><th>Первичная моча</th><th>Конечная моча</th></tr></thead>
        <tbody>
          {URINE_TABLE.map(([a, b, c]) => (
            <tr key={a}>
              <td><b>{a}</b></td>
              <td className={b.startsWith('да') ? 'yes' : 'no'}>{b}</td>
              <td className={c.startsWith('да') ? 'yes' : 'no'}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}
