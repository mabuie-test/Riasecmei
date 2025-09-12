import React, {useEffect, useState} from 'react'
import TestForm from './TestForm'
import RadarChart from './RadarChart'
import CircleProfile from './CircleProfile'

const labels = ['Realista (R)','Investigativo (I)','Artístico (A)','Social (S)','Empreendedor (E)','Convencional (C)']

export default function Dashboard(){
  const [profile,setProfile] = useState(null)

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token')
      if(!token) return
      try{
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/me`, { headers: { Authorization: `Bearer ${token}` }})
        const data = await res.json()
        setProfile(data.profile)
      }catch(err){ }
    }
    load()
  },[])

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
