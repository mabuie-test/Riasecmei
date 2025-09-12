// client/src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NavBar from './components/NavBar'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import AdminCompareMulti from './components/AdminCompareMulti'

// componente de boas-vindas (overlay)
import WelcomeOverlay from './components/WelcomeOverlay'

export default function App(){
  return (
    <BrowserRouter>
      <NavBar />

      {/* Overlay de boas-vindas — aparece por cima da app */}
      <WelcomeOverlay
        developer={{
          name: 'Teu Nome',
          role: 'Desenvolvedor',
          contact: 'teu@email.com',
          more: 'MEI — RIASEC v1'
        }}
        showOnce={true}       /* true = aparece só na primeira visita */
        autoHideSeconds={0}   /* 0 = não auto-fechar; altera se quiseres auto 6s */
      />

      <Routes>
        <Route path='/' element={<Dashboard/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/admin/compare' element={<AdminCompareMulti/>} />
      </Routes>
    </BrowserRouter>
  )
}
