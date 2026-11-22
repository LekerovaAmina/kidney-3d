import Nav from './components/Nav.jsx'
import KidneyExplorer from './kidney/KidneyExplorer.jsx'
import Location from './sections/Location.jsx'
import Numbers from './sections/Numbers.jsx'
import Nephron from './sections/Nephron.jsx'
import Urine from './sections/Urine.jsx'
import { Functions, Regulation, BloodSupply } from './sections/Functions.jsx'
import { Diseases, History, Care } from './sections/Health.jsx'
import { Facts, Quiz, QR, Sources } from './sections/Fun.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <header className="hero" id="model">
        <div className="hero-top">
          <div>
            <div className="kicker">Интерактивный 3D-атлас · биология</div>
            <h1>Почка — <em>живой фильтр</em> организма</h1>
          </div>
          <div>
            <p className="lead">
              Вращайте модель, разрежьте её и посмотрите, как устроена почка изнутри: от капсулы и пирамид до
              сосудов, по которым течёт кровь.
            </p>
            <div className="hero-stats">
              <div><b>~1 млн</b>нефронов</div>
              <div><b>180 л</b>фильтрата в сутки</div>
              <div><b>150 г</b>масса</div>
            </div>
          </div>
        </div>
        <KidneyExplorer />
      </header>
      <main>
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
      <footer className="footer">
        Учебный проект по биологии · Почка человека · {new Date().getFullYear()}
      </footer>
    </>
  )
}
