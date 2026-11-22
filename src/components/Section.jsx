import { useInView } from './hooks.js'

/** Обёртка раздела: якорь для меню + плавное появление при прокрутке */
export default function Section({ id, kicker, title, lead, children }) {
  const [ref, inView] = useInView(0.08)
  return (
    <section id={id} ref={ref} className={'section reveal' + (inView ? ' in' : '')}>
      {kicker && <div className="kicker">{kicker}</div>}
      {title && <h2>{title}</h2>}
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  )
}
