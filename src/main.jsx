import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/unbounded/400.css'
import '@fontsource/unbounded/600.css'
import '@fontsource/unbounded/800.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/800.css'
import './styles.css'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
)
