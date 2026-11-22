import { useState } from 'react'
import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'

// Пути канальца (координаты SVG 620×600)
const SEG = {
  pct: 'M165,160 C200,190 215,120 240,140 S270,200 290,160 S320,110 335,150 L335,175',
  loop: 'M335,175 L335,520 C335,560 385,560 385,520 L385,230',
  dct: 'M385,230 C385,200 420,230 430,200 S450,150 470,180 S500,215 520,190 C530,182 545,188 545,205',
  cd: 'M545,30 L545,590',
}
const TUBULE =
  'M165,160 C200,190 215,120 240,140 S270,200 290,160 S320,110 335,150 L335,520 C335,560 385,560 385,520 L385,230 C385,200 420,230 430,200 S450,150 470,180 S500,215 520,190 C530,182 545,188 545,205 L545,590'
const CAPILLARY =
  'M40,84 C150,58 250,66 290,100 C302,115 300,150 300,180 L300,520 C300,598 420,598 420,520 L420,250 C420,215 480,150 612,150'

function Dots({ path, count, dur, color, r = 4 }) {
  return Array.from({ length: count }, (_, i) => (
    <circle key={i} r={r} fill={color}>
      <animateMotion dur={dur + 's'} repeatCount="indefinite" begin={-(i * dur) / count + 's'} path={path} rotate="auto" />
    </circle>
  ))
}

// короткие «стрелки» обмена веществ между канальцем и капилляром
function Exchange({ from, to, color, n = 3, dur = 1.6 }) {
  const d = `M${from[0]},${from[1]} L${to[0]},${to[1]}`
  return Array.from({ length: n }, (_, i) => (
    <circle key={i} r="3.2" fill={color}>
      <animateMotion dur={dur + 's'} repeatCount="indefinite" begin={-(i * dur) / n + 's'} path={d} />
      <animate attributeName="opacity" values="0;1;1;0" dur={dur + 's'} repeatCount="indefinite" begin={-(i * dur) / n + 's'} />
    </circle>
  ))
}

function NephronSVG({ active, setActive }) {
  const { NEPHRON_STEPS, ui } = useT()
  const N = ui.nephronSvg
  const cls = (id) => 'seg' + (active ? (active === id ? ' hl' : ' dim') : '')
  const col = (id) => NEPHRON_STEPS.find((s) => s.id === id).color
  return (
    <svg className="nephron-svg" viewBox="0 0 620 600" role="img" aria-label={N.aria}>
      <defs>
        <linearGradient id="capGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#e2503f" />
          <stop offset="1" stopColor="#5b74e6" />
        </linearGradient>
        <radialGradient id="glom" cx="40%" cy="40%">
          <stop offset="0" stopColor="#ff7a66" />
          <stop offset="1" stopColor="#8e1f1b" />
        </radialGradient>
      </defs>
      {/* зоны */}
      <rect x="0" y="0" width="620" height="250" fill="rgba(160,52,44,0.10)" />
      <rect x="0" y="250" width="620" height="350" fill="rgba(200,100,90,0.05)" />
      <line x1="0" y1="250" x2="620" y2="250" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 6" />
      <text x="402" y="242" fontSize="11" opacity="0.6">{N.cortex}</text>
      <text x="402" y="268" fontSize="11" opacity="0.6">{N.medulla}</text>

      {/* перитубулярный капилляр / прямые сосуды */}
      <path d={CAPILLARY} stroke="url(#capGrad)" strokeWidth="4" fill="none" opacity="0.7" strokeDasharray="10 8">
        <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1s" repeatCount="indefinite" />
      </path>

      {/* артериолы */}
      <path d="M20,206 C70,196 95,176 112,158" stroke="#d8302c" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M116,122 C96,100 70,90 40,84" stroke="#a8241f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Dots path="M20,206 C70,196 95,176 118,152" count={4} dur={1.4} color="#ffb3a6" r={3} />

      {/* почечное тельце */}
      <g className={cls('corpuscle')} onClick={() => setActive('corpuscle')} style={{ color: col('corpuscle') }}>
        <circle cx="134" cy="140" r="30" fill="url(#glom)" />
        {[0, 40, 80, 120, 160].map((a) => (
          <ellipse key={a} cx="134" cy="140" rx="26" ry="10" fill="none" stroke="#ffb3a6" strokeWidth="2" opacity="0.7" transform={`rotate(${a} 134 140)`} />
        ))}
        <path d="M104,102 A50,50 0 1 1 104,178" stroke="#f2c766" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M112,112 A38,38 0 1 1 112,168" stroke="#f2c766" strokeWidth="2" fill="none" opacity="0.6" />
      </g>

      {/* каналец: оболочка + просвет */}
      <path d={TUBULE} stroke="#5a2a2c" strokeWidth="18" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={SEG.cd} stroke="#5a2a2c" strokeWidth="22" fill="none" strokeLinecap="round" />
      {Object.entries(SEG).map(([id, d]) => (
        <path key={id} d={d} className={cls(id)} onClick={() => setActive(id)}
          stroke={col(id)} style={{ color: col(id) }} strokeWidth={id === 'cd' ? 14 : 11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d={TUBULE} stroke="rgba(20,8,10,0.55)" strokeWidth="4" fill="none" pointerEvents="none" />

      {/* фильтрат движется по канальцу */}
      <Dots path={TUBULE} count={14} dur={12} color="#fff6c4" r={3.6} />

      {/* обмен веществ */}
      <Exchange from={[262, 150]} to={[270, 92]} color="#73d6a4" />
      <Exchange from={[318, 140]} to={[300, 116]} color="#73d6a4" />
      <Exchange from={[335, 330]} to={[302, 330]} color="#8fb0ff" />
      <Exchange from={[335, 430]} to={[302, 430]} color="#8fb0ff" />
      <Exchange from={[385, 360]} to={[418, 360]} color="#f2c766" />
      <Exchange from={[385, 300]} to={[418, 300]} color="#f2c766" />
      <Exchange from={[470, 156]} to={[466, 182]} color="#c9a2ff" />
      <Exchange from={[545, 420]} to={[590, 420]} color="#8fb0ff" />
      <Exchange from={[545, 480]} to={[590, 480]} color="#8fb0ff" />

      {/* подписи */}
      <text x="14" y="236">{N.afferent}</text>
      <text x="30" y="66">{N.efferent}</text>
      <text x="34" y="146">{N.glom}</text>
      <text x="120" y="214">{N.capsule}</text>
      <text x="200" y="100" fill="#f2c766">{N.pct}</text>
      <text x="236" y="480" fill="#73d6a4">{N.loop}</text>
      <text x="400" y="128" fill="#7b98ff">{N.dct}</text>
      <text x="566" y="330" fill="#c9a2ff" transform="rotate(90 566 330)">{N.cd}</text>
      <text x="14" y="586" fontSize="11">
        {N.legend.map((l, i) => <tspan key={i} fill={['#8fb0ff', '#f2c766', '#73d6a4', '#c9a2ff', '#fff6c4'][i]}>{l}{'  '}</tspan>)}
      </text>
    </svg>
  )
}

export default function Nephron() {
  const { NEPHRON_STEPS } = useT()
  const [active, setActive] = useState('corpuscle')
  return (
    <Section id="nephron">
      <div className="nephron-wrap">
        <NephronSVG active={active} setActive={setActive} />
        <div className="steps">
          {NEPHRON_STEPS.map((s) => (
            <button key={s.id} className={'step' + (active === s.id ? ' active' : '')} style={{ '--c': s.color }}
              onClick={() => setActive(active === s.id ? null : s.id)}>
              <h4><i style={{ background: s.color }} />{s.title}</h4>
              <div className="body">{s.text}</div>
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}
