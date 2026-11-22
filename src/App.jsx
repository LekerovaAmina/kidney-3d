import Nav from './components/Nav.jsx'
import KidneyExplorer from './kidney/KidneyExplorer.jsx'
import Location from './sections/Location.jsx'
import Numbers from './sections/Numbers.jsx'
import Nephron from './sections/Nephron.jsx'
import Urine from './sections/Urine.jsx'
import { Functions, Regulation, BloodSupply } from './sections/Functions.jsx'
import { Diseases, History, Care } from './sections/Health.jsx'
import { Facts, Quiz, QR, Sources } from './sections/Fun.jsx'
import { useLang } from './i18n.jsx'

export default function App() {
  const { lang, t } = useLang()
  const H = t.ui.hero
  return (
    <>
      <Nav />
      <header className="hero" id="model">
        <div className="lab-badge">
          <span className="lab-ico">🔬</span>
          <div>
            <b>{t.ui.lab.title}</b>
            <span>{t.ui.lab.by}</span>
          </div>
        </div>
        <div className="hero-top">
          <div>
            <div className="kicker">{H.kicker}</div>
            <h1>{H.t1} <em>{H.t2}</em> {H.t3}</h1>
          </div>
          <div>
            <p className="lead">{H.lead}</p>
            <div className="hero-stats">
              {H.stats.map(([v, l]) => <div key={l}><b>{v}</b>{l}</div>)}
            </div>
          </div>
        </div>
        <KidneyExplorer />
      </header>
      {/* key={lang}: при смене языка квиз и вкладки начинаются заново */}
      <main key={lang}>
        <Location />
        <Numbers />
        <Nephron />
        <Urine />
        <Functions />
        <Regulation />
        <BloodSupply />
        <Diseases />
        <History />
        <Care />
        <Facts />
        <Quiz />
        <QR />
        <Sources />
      </main>
      <footer className="footer">{t.ui.footer} · {new Date().getFullYear()}</footer>
    </>
  )
}
