// client/src/components/WelcomeOverlay.jsx
import React, { useEffect, useState } from 'react'

export default function WelcomeOverlay({
  developer = { name: 'Teu Nome', role: 'Desenvolvedor', contact: 'teu@email.com', more: 'MEI — RIASEC' },
  showOnce = true,    // se true: guarda em localStorage e não mostra novamente
  autoHideSeconds = 0 // >0 para auto-ocultar após N segundos, 0 para não auto
}) {
  const STORAGE_KEY = 'mei_welcome_seen_v1'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (showOnce && seen) {
        setVisible(false)
        return
      }
      // mostrar com pequeno atraso para o app carregar
      const t = setTimeout(() => setVisible(true), 350)
      return () => clearTimeout(t)
    } catch (e) {
      setVisible(true)
    }
  }, [showOnce])

  useEffect(() => {
    let timer
    if (visible && autoHideSeconds > 0) {
      timer = setTimeout(() => handleClose(true), autoHideSeconds * 1000)
    }
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  function handleClose(fromAuto = false) {
    try {
      if (showOnce) localStorage.setItem(STORAGE_KEY, 'true')
    } catch (e) { /* ignore */ }
    // small fade out animation time must match CSS .welcome-card .exit animation (300ms)
    const el = document.getElementById('welcome-overlay-card')
    if (el) el.classList.add('welcome-exit')
    setTimeout(() => setVisible(false), 320)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Boas-vindas MEI RIASEC"
    >
      <div
        id="welcome-overlay-card"
        className="welcome-card max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        style={{ transformOrigin: 'center' }}
      >
        <div className="flex">
          {/* Left visual */}
          <div className="w-1/3 hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-6">
            <div className="text-center text-white">
              <div className="text-3xl font-extrabold">MEI</div>
              <div className="mt-2 text-sm opacity-90">{developer.more}</div>
            </div>
          </div>

          {/* Right content */}
          <div className="w-full md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Bem-vindo ao MEI — RIASEC</h2>
                <p className="mt-1 text-sm text-gray-600">Plataforma de avaliação de interesses profissionais</p>
              </div>
              <button
                onClick={() => handleClose(false)}
                aria-label="Fechar"
                className="text-gray-400 hover:text-gray-700"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-700">
              <p>Olá — sou <strong>{developer.name}</strong>, {developer.role} deste projecto.</p>
              <p className="mt-2">Se precisares de suporte ou mais informações contacta: <strong>{developer.contact}</strong>.</p>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleClose(false) }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-95"
              >
                Começar → 
              </a>

              <button
                onClick={() => {
                  window.location.href = '/about' // opcional: muda para rota info
                }}
                className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm"
              >
                Mais info
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              <em>Mensagem de identidade do desenvolvedor — aparece na primeira visita (podes desactivar em configurações).</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
