// client/src/components/TestForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../data/questions'
import axios from 'axios'

export default function TestForm({ onSubmit }) {
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // initialize answers with zeros
    const map = {}
    QUESTIONS.forEach(q => (map[q.id] = 0))
    setAnswers(map)

    // check auth
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  function setVal(id, v) {
    setAnswers(prev => ({ ...prev, [id]: Number(v) }))
  }

  async function submit(e) {
    e.preventDefault()

    // compute sums per key and counts
    const sums = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

    Object.entries(answers).forEach(([id, val]) => {
      const q = QUESTIONS.find(x => x.id === id)
      if (!q) return
      sums[q.key] += Number(val)
      counts[q.key] += 1
    })

    const token = localStorage.getItem('token')
    if (!token) {
      // show friendly message with navigation options
      const go = window.confirm('Precisas de iniciar sessão para submeter o teste. Desejas ir para a página de iniciar sessão? (Cancelar abre a página de registo)')
      if (go) {
        navigate('/login', { replace: true })
      } else {
        navigate('/register', { replace: true })
      }
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profiles/submit`,
        { sums, counts, rawAnswers: answers },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSubmit(res.data.profile)
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        // token inválido/expirado: limpar e redirecionar
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        alert('Sessão expirada ou inválida. Por favor inicie sessão novamente.')
        navigate('/login', { replace: true })
        return
      }
      alert(err.response?.data?.message || 'Erro ao salvar. Tenta novamente mais tarde.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Questionário de Interesses (exemplo)</h3>
        {!isAuthenticated && (
          <div className="text-sm">
            <span className="mr-2 text-gray-600">Ainda não tens conta?</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="mr-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Registar
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Entrar
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600">Responda de 0 (não gosto) a 3 (gosto muito)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTIONS.map(q => (
          <div key={q.id} className="p-3 border rounded">
            <div className="font-medium">{q.text}</div>
            <div className="mt-2">
              <select
                value={answers[q.id] ?? 0}
                onChange={e => setVal(q.id, e.target.value)}
                className="border p-1"
                disabled={submitting || !isAuthenticated}
              >
                <option value={0}>0 - Não gosto</option>
                <option value={1}>1 - Gosto pouco</option>
                <option value={2}>2 - Gosto moderado</option>
                <option value={3}>3 - Gosto muito</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        {!isAuthenticated && (
          <div className="text-sm text-gray-500">
            Tens de <button type="button" className="text-blue-600 underline" onClick={() => navigate('/login')}>entrar</button> ou <button type="button" className="text-blue-600 underline" onClick={() => navigate('/register')}>registar</button> para submeter o teste.
          </div>
        )}
        <div className="flex justify-end w-full">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'A enviar...' : 'Enviar'}
          </button>
        </div>
      </div>
    </form>
  )
}
