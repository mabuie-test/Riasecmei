// client/src/components/Dashboard.jsx
import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import TestForm from './TestForm'
import CircleProfile from './CircleProfile'

const labels = ['Realista (R)','Investigativo (I)','Artístico (A)','Social (S)','Empreendedor (E)','Convencional (C)']

export default function Dashboard(){
  const [profile,setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token')
      if(!token){
        // Não autenticado -> redirecionar para login
        setLoading(false)
        navigate('/login', { replace: true })
        return
      }
      try{
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/me`, { headers: { Authorization: `Bearer ${token}` }})
        const data = await res.json()
        if(res.status === 401){
          // token inválido/expirado -> remover e redirecionar
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/login', { replace: true })
          return
        }
        setProfile(data.profile)
      }catch(err){
        console.error('Erro ao carregar perfil', err)
      }finally{
        setLoading(false)
      }
    }
    load()
  },[navigate])

  if(loading) return <div className="p-6">A carregar...</div>

  return (
    <div className='container mx-auto p-6'>
      <div className='flex gap-6'>
        <div className='w-2/3'>
          <TestForm onSubmit={(p)=>setProfile(p)} />
        </div>
        <div className='w-1/3'>
          <div className='bg-white p-4 rounded shadow'>
            <h3 className='font-bold mb-2'>Resultado</h3>
            {profile ? (
              <CircleProfile scores={profile.scores} size={340} />
            ) : (
              <p className='text-sm text-gray-600'>Ainda não respondeu ao questionário.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
