import Section from '../components/Section.jsx'
import { useT } from '../i18n.jsx'

const BEAN = 'M0,-36 C22,-36 30,-14 30,4 C30,26 18,36 2,36 C-12,36 -14,24 -8,14 C-4,8 -4,-4 -8,-10 C-14,-22 -14,-36 0,-36 Z'

function BodySVG() {
  const L = useT().ui.body
  const vertebrae = Array.from({ length: 16 }, (_, i) => 40 + i * 18)
  const ribs = [96, 112, 128, 144, 160, 176]
  return (
    <svg className="body-svg" viewBox="0 0 300 420" role="img" aria-label={L.aria}>
      <defs>
        <radialGradient id="kgrad" cx="40%" cy="35%">
          <stop offset="0" stopColor="#ff8a75" />
          <stop offset="1" stopColor="#b8352d" />
        </radialGradient>
      </defs>
      <path d="M60 20 C30 30 28 80 40 140 C50 200 56 240 50 300 C47 340 60 380 82 404 L218 404 C240 380 253 340 250 300 C244 240 250 200 260 140 C272 80 270 30 240 20 Z"
        fill="rgba(255,220,210,0.05)" stroke="rgba(255,220,210,0.25)" strokeWidth="1.5" />
      {/* печень */}
      <path d="M58 132 C80 112 150 112 172 128 C160 150 120 166 70 170 C58 160 54 146 58 132 Z" fill="rgba(160,80,60,0.35)" />
      <text x="70" y="128" fontSize="9" fill="#d9a89c">{L.liver}</text>
      {/* позвоночник */}
      {vertebrae.map((y, i) => (
        <rect key={y} x="141" y={y} width="18" height="13" rx="3"
          fill={i === 7 || i === 10 ? 'rgba(242,199,102,0.55)' : 'rgba(255,240,230,0.22)'} />
      ))}
      <text x="163" y="176" fontSize="9" fill="#f2c766">Th12</text>
      <text x="163" y="230" fontSize="9" fill="#f2c766">L3</text>
      {/* рёбра */}
      {ribs.map((y, i) => (
        <g key={y} stroke={i >= 4 ? 'rgba(242,199,102,0.7)' : 'rgba(255,240,230,0.18)'} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d={`M141 ${y} C110 ${y + 4} ${86 - i * 2} ${y + 18} ${78 - i * 3 + (i >= 4 ? 22 : 0)} ${y + 36}`} />
          <path d={`M159 ${y} C190 ${y + 4} ${214 + i * 2} ${y + 18} ${222 + i * 3 - (i >= 4 ? 22 : 0)} ${y + 36}`} />
        </g>
      ))}
      {/* полая вена и аорта */}
      <rect x="135" y="60" width="9" height="250" rx="4" fill="#3b5bd6" opacity="0.85" />
      <rect x="156" y="60" width="8" height="250" rx="4" fill="#d8302c" opacity="0.9" />
      {/* почки: правая (слева на рисунке) ниже */}
      <g transform="translate(108 214) scale(-1 1)">
        <path d={BEAN} fill="url(#kgrad)" />
      </g>
      <g transform="translate(192 200)">
        <path d={BEAN} fill="url(#kgrad)" />
      </g>
      {/* сосуды почек */}
      <path d="M156 198 L186 198" stroke="#d8302c" strokeWidth="4" />
      <path d="M144 212 L114 212" stroke="#3b5bd6" strokeWidth="4" />
      <path d="M144 190 L186 190" stroke="#3b5bd6" strokeWidth="4" opacity="0.9" />
      <path d="M156 220 L114 220" stroke="#d8302c" strokeWidth="4" opacity="0.9" />
      {/* надпочечники */}
      <path d="M96 176 L112 160 L124 178 Z" fill="#e2a43c" />
      <path d="M180 158 C190 150 206 152 212 164 L184 166 Z" fill="#e2a43c" />
      {/* мочеточники и пузырь */}
      <path className="draw" d="M116 230 C120 290 132 340 142 368" stroke="#f2c766" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path className="draw" d="M184 214 C180 290 168 340 158 368" stroke="#f2c766" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="150" cy="378" rx="22" ry="15" fill="#e8c76b" opacity="0.9" />
      <text x="176" y="398" fontSize="9" fill="#e8c76b">{L.bladder}</text>
      <text x="40" y="244" fontSize="10" fill="#fff" fontWeight="700">{L.right}</text>
      <text x="222" y="230" fontSize="10" fill="#fff" fontWeight="700">{L.left}</text>
      <text x="196" y="146" fontSize="8" fill="#e2a43c">{L.adrenal}</text>
    </svg>
  )
}

export default function Location() {
  const { LOCATION } = useT()
  return (
    <Section id="where">
      <div className="location">
        <BodySVG />
        <div className="loc-points">
          {LOCATION.map(([t, d], i) => (
            <div className="loc-point" key={t}>
              <div className="n">{i + 1}</div>
              <p><b>{t}</b>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
