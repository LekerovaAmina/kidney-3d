import { useState } from 'react'
import Section from '../components/Section.jsx'
import Counter from '../components/Counter.jsx'
import { DISEASES, TIMELINE, TIPS } from '../data/content.js'

export function Diseases() {
  const [id, setId] = useState(DISEASES[0].id)
  const d = DISEASES.find((x) => x.id === id)
  return (
    <Section id="diseases" kicker="Медицина" title="Болезни почек"
      lead="Почки могут долго работать «молча», даже когда им плохо. Поэтому важно знать тревожные признаки.">
      <div className="ckd-banner">
        <div className="card"><b><Counter value={788} /> млн</b>взрослых в мире живут с хронической болезнью почек (2023)</div>
        <div className="card"><b>≈<Counter value={14} />%</b>взрослых — примерно каждый седьмой</div>
        <div className="card"><b><Counter value={9} />-я</b>причина смерти в мире — и одна из немногих, которые продолжают расти</div>
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
          <h4>Признаки</h4>
          <ul>{d.symptoms.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="card">
          <h4>Профилактика</h4>
          <ul>{d.prevent.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
      <div className="alert">
        <span style={{ fontSize: 24 }}>⚠️</span>
        Информация на сайте — учебная и не заменяет консультацию врача. При боли в пояснице, температуре, крови в моче
        или резком уменьшении количества мочи нужно обратиться к врачу.
      </div>
    </Section>
  )
}

export function History() {
  return (
    <Section id="history" kicker="История" title="Как люди изучали почки"
      lead="От первого взгляда в микроскоп до искусственной почки и пересадки органов.">
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
          <h3>🩻 Гемодиализ</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Кровь пропускают через аппарат «искусственная почка»: через полупроницаемую мембрану отходы переходят в специальный раствор. Обычно процедура длится около 4 часов, 3 раза в неделю.</p>
        </div>
        <div className="card">
          <h3>🫘 Пересадка почки</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Донорскую почку подшивают к сосудам и мочевому пузырю. Чтобы иммунитет её не отторг, человек всю жизнь принимает специальные лекарства.</p>
        </div>
      </div>
    </Section>
  )
}

export function Care() {
  return (
    <Section id="care" kicker="Здоровье" title="Как беречь почки" lead="Простые привычки, которые помогают почкам работать долго.">
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
