// client/src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import AdminCompareMulti from './components/AdminCompareMulti'
import ShowStorage from './components/ShowStorage' // debug (remover quando não precisar)

export default function App(){
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Dashboard/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/admin/compare' element={<AdminCompareMulti/>} />
        {/* rota de debug - remover em produção */}
        <Route path='/debug' element={<ShowStorage/>} />
      </Routes>
    </BrowserRouter>
  )
}
