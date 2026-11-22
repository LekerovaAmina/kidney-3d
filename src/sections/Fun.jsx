import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Section from '../components/Section.jsx'
import { FACTS, QUIZ, SOURCES } from '../data/content.js'

export function Facts() {
  const [open, setOpen] = useState({})
  return (
    <Section id="facts" kicker="Удивительное" title="Интересные факты" lead="Нажмите на карточку, чтобы перевернуть её.">
      <div className="facts">
        {FACTS.map(([t, d], i) => (
          <div key={t} className={'fact' + (open[i] ? ' flip' : '')} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
            <div className="fact-in">
              <div className="fact-face front"><b>{t}</b><span>нажми, чтобы узнать ↻</span></div>
              <div className="fact-face back">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function Quiz() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= QUIZ.length
  const q = QUIZ[i]
  const choose = (k) => {
    if (pick !== null) return
    setPick(k)
    if (k === q.c) setScore((s) => s + 1)
  }
  const next = () => { setPick(null); setI((x) => x + 1) }
  const restart = () => { setI(0); setPick(null); setScore(0) }
  return (
    <Section id="quiz" kicker="Проверь себя" title="Квиз о почках" lead="10 вопросов по материалу сайта.">
      <div className="quiz card">
        <div className="quiz-bar"><div style={{ width: (Math.min(i, QUIZ.length) / QUIZ.length) * 100 + '%' }} /></div>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56 }}>{score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}</div>
            <h3>Результат: {score} из {QUIZ.length}</h3>
            <p style={{ color: 'var(--muted)' }}>
              {score >= 8 ? 'Отлично! Вы настоящий знаток почек.' : score >= 5 ? 'Хорошо! Загляните ещё раз в разделы о нефроне и гормонах.' : 'Пролистайте сайт ещё раз — и попробуйте снова!'}
            </p>
            <button className="btn" onClick={restart}>Пройти ещё раз</button>
          </div>
        ) : (
          <>
            <div className="part-kicker">Вопрос {i + 1} из {QUIZ.length}</div>
            <h3>{q.q}</h3>
            <div className="opts">
              {q.a.map((a, k) => (
                <button key={a} disabled={pick !== null}
                  className={'opt' + (pick !== null && k === q.c ? ' right' : '') + (pick === k && k !== q.c ? ' wrong' : '')}
                  onClick={() => choose(k)}>{a}</button>
              ))}
            </div>
            {pick !== null && (
              <>
                <div className="explain">{pick === q.c ? '✅ Верно! ' : '❌ Не совсем. '}{q.e}</div>
                <button className="btn" onClick={next}>{i === QUIZ.length - 1 ? 'Результат' : 'Дальше →'}</button>
              </>
            )}
          </>
        )}
      </div>
    </Section>
  )
}

export function QR() {
  const defaultUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''
  const [url, setUrl] = useState(defaultUrl)
  const wrap = useRef(null)
  const download = () => {
    const canvas = wrap.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qr-pochka.png'
    a.click()
  }
  return (
    <Section id="qr" kicker="Для макета" title="QR-код на этот сайт"
      lead="Распечатайте QR-код и приклейте на макет почки — по нему можно будет открыть этот сайт с телефона.">
      <div className="qr-wrap">
        <div className="qr-card" ref={wrap}>
          <QRCodeCanvas value={url || ' '} size={240} level="M" marginSize={1} fgColor="#120a0b" />
          <div className="cap">Отсканируй и узнай всё о почке</div>
          <div className="sub">3D-модель · нефрон · функции · квиз</div>
        </div>
        <div className="qr-form">
          <p style={{ color: 'var(--muted)' }}>
            Код создаётся для адреса, который сейчас открыт. После публикации сайта (например, на GitHub Pages) откройте
            опубликованную версию — и QR сам возьмёт правильный адрес. Или вставьте ссылку вручную:
          </p>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={download}>Скачать PNG</button>
            <button className="btn ghost" onClick={() => window.print()}>Печать</button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function Sources() {
  return (
    <Section id="sources" kicker="Литература" title="Источники">
      <ol className="sources">
        {SOURCES.map(([t, u]) => (
          <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>
        ))}
      </ol>
    </Section>
  )
}
