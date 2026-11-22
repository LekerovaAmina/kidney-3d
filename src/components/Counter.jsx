import { useEffect, useState } from 'react'
import { useInView } from './hooks.js'

/** Число, которое «набегает» при появлении на экране */
export default function Counter({ value, decimals = 0, format, duration = 1800 }) {
  const [ref, inView] = useInView(0.4)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      setV(value * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])
  let text
  if (format === 'mln') text = v >= 999999 ? '1 млн' : Math.round(v).toLocaleString('ru-RU')
  else text = v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref}>{text}</span>
}
