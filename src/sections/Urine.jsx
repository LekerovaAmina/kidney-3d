import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'
import { useInView } from '../components/hooks.js'
// какие ячейки «есть» (зелёные), а какие «нет» (красные): [первичная, конечная]
const FLAGS = [[1, 1], [1, 0], [1, 0], [0, 0], [0, 0], [1, 1], [1, 1]]

export default function Urine() {
  const [ref, inView] = useInView(0.3)
  const { STAGES, URINE_TABLE, ui } = useT()
  const U = ui.urine
  return (
    <Section id="urine">
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
          <b>{U.v180}</b><span>{U.primary}</span>
        </div>
        <div className="arrow-mid"><span className="big">→</span>{U.back[0]}<br />{U.back[1]}</div>
        <div className="vol">
          <div className="tank"><div className="fill" style={{ height: inView ? '0.9%' : 0, minHeight: inView ? 6 : 0, background: 'linear-gradient(#ffe28a, #e0a93a)' }} /></div>
          <b>{U.v15}</b><span>{U.final}</span>
        </div>
      </div>

      <table className="cmp">
        <thead><tr>{U.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {URINE_TABLE.map(([a, b, c], i) => (
            <tr key={a}>
              <td><b>{a}</b></td>
              <td className={FLAGS[i][0] ? 'yes' : 'no'}>{b}</td>
              <td className={FLAGS[i][1] ? 'yes' : 'no'}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}
