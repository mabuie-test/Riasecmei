// client/src/components/NavBar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const user = userStr ? JSON.parse(userStr) : null
  const navigate = useNavigate()

  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-white shadow p-3 flex justify-between items-center">
      <div className="font-bold">MEI-RIASEC</div>
      <div className="flex items-center gap-3">
        {user && user.isAdmin && <Link to="/admin/compare" className="text-sm text-blue-600">Admin</Link>}
        {user ? (
          <>
            <span className="text-sm text-gray-700">{user.name}</span>
            <button onClick={logout} className="text-sm text-red-500">Sair</button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-blue-600">Entrar</Link>
        )}
      </div>
    </nav>
  )
}
