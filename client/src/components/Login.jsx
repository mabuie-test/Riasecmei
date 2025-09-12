// client/src/components/Login.jsx
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/', { replace: true })
    }catch(err){
      setError(err.response?.data?.message || 'Erro ao iniciar sessão')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Iniciar Sessão</h2>

        {error && (<div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>)}

        <form onSubmit={submit}>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="border p-2 w-full mb-4"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="block mb-2">Senha</label>
          <input
            type="password"
            className="border p-2 w-full mb-4"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'A iniciar...' : 'Entrar'}
            </button>

            <div className="text-sm">
              <span className="text-gray-600 mr-2">Ainda não tens conta?</span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-green-600 font-medium hover:underline"
              >
                Registar
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          Se tens problemas com registo, confirma que o servidor de autenticação está no ar e que a variável VITE_API_URL está corretamente definida.
        </div>
      </div>
    </div>
  )
}
