import { createContext, useContext, useEffect, useState } from 'react'
import ru from './data/ru.js'
import kk from './data/kk.js'

const DICTS = { ru, kk }
const LangCtx = createContext({ lang: 'ru', setLang: () => {}, t: ru })

function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q && DICTS[q]) return q
    const saved = localStorage.getItem('lang')
    if (saved && DICTS[saved]) return saved
  } catch { /* localStorage может быть недоступен */ }
  return 'ru'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const setLang = (l) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch { /* */ }
  }
  const t = DICTS[lang]
  useEffect(() => {
    document.documentElement.lang = t.ui.htmlLang
    document.title = t.ui.pageTitle
  }, [t])
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

/** Текущий словарь: t.ui — подписи интерфейса, t.STATS, t.QUIZ ... — контент */
export const useT = () => useContext(LangCtx).t
export const useLang = () => useContext(LangCtx)
