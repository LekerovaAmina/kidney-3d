import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'

export function Facts() {
  const { FACTS, ui } = useT()
  const [open, setOpen] = useState({})
  return (
    <Section id="facts">
      <div className="facts">
        {FACTS.map(([t, d], i) => (
          <div key={t} className={'fact' + (open[i] ? ' flip' : '')} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
            <div className="fact-in">
              <div className="fact-face front"><b>{t}</b><span>{ui.facts.tap}</span></div>
              <div className="fact-face back">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function Quiz() {
  const { QUIZ, ui } = useT()
  const T = ui.quiz
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
    <Section id="quiz">
      <div className="quiz card">
        <div className="quiz-bar"><div style={{ width: (Math.min(i, QUIZ.length) / QUIZ.length) * 100 + '%' }} /></div>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56 }}>{score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}</div>
            <h3>{T.result(score, QUIZ.length)}</h3>
            <p style={{ color: 'var(--muted)' }}>
              {score >= 8 ? T.great : score >= 5 ? T.good : T.bad}
            </p>
            <button className="btn" onClick={restart}>{T.again}</button>
          </div>
        ) : (
          <>
            <div className="part-kicker">{T.q(i + 1, QUIZ.length)}</div>
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
                <div className="explain">{pick === q.c ? T.right : T.wrong}{q.e}</div>
                <button className="btn" onClick={next}>{i === QUIZ.length - 1 ? T.finish : T.next}</button>
              </>
            )}
          </>
        )}
      </div>
    </Section>
  )
}

export function QR() {
  const Q = useT().ui.qr
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
    <Section id="qr">
      <div className="qr-wrap">
        <div className="qr-card" ref={wrap}>
          <QRCodeCanvas value={url || ' '} size={240} level="M" marginSize={1} fgColor="#120a0b" />
          <div className="cap">{Q.cap}</div>
          <div className="sub">{Q.sub}</div>
        </div>
        <div className="qr-form">
          <p style={{ color: 'var(--muted)' }}>
            {Q.text}
          </p>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={download}>{Q.download}</button>
            <button className="btn ghost" onClick={() => window.print()}>{Q.print}</button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function Sources() {
  const { SOURCES } = useT()
  return (
    <Section id="sources">
      <ol className="sources">
        {SOURCES.map(([t, u]) => (
          <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>
        ))}
      </ol>
    </Section>
  )
}
