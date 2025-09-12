import React, {useEffect, useState} from 'react'
import axios from 'axios'
import RadarChart from './RadarChart'

const labels = ['Realista (R)','Investigativo (I)','Artístico (A)','Social (S)','Empreendedor (E)','Convencional (C)']

export default function AdminCompare(){
  const [profiles, setProfiles] = useState([])
  const [selectedA, setSelectedA] = useState('')
  const [selectedB, setSelectedB] = useState('')
  const [compareData, setCompareData] = useState(null)

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token')
      try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profiles/all`, { headers: { Authorization: `Bearer ${token}` }})
        setProfiles(res.data.profiles)
      }catch(err){ alert('Need admin privileges') }
    }
    load()
  },[])

  async function runCompare(){
    const token = localStorage.getItem('token')
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profiles/compare?a=${selectedA}&b=${selectedB}`, { headers: { Authorization: `Bearer ${token}` }})
    setCompareData(res.data)
  }

  return (
    <div className='container mx-auto p-6'>
      <h2 className='text-xl font-bold mb-4'>Admin — Comparar Perfis</h2>
      <div className='bg-white p-4 rounded shadow mb-4'>
        <label>Perfil A</label>
        <select className='border p-2 w-full mb-2' value={selectedA} onChange={e=>setSelectedA(e.target.value)}>
          <option value=''>-- selecione --</option>
          {profiles.map(p=> <option key={p._id} value={p.userId._id}>{p.userId.name} ({p.userId.email})</option>)}
        </select>
        <label>Perfil B</label>
        <select className='border p-2 w-full mb-2' value={selectedB} onChange={e=>setSelectedB(e.target.value)}>
          <option value=''>-- selecione --</option>
          {profiles.map(p=> <option key={p._id} value={p.userId._id}>{p.userId.name} ({p.userId.email})</option>)}
        </select>
        <div className='flex justify-end'>
          <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={runCompare}>Comparar</button>
        </div>
      </div>
      {compareData && (
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded shadow'>
            <h3 className='font-bold'>{compareData.a.userId.name}</h3>
            <RadarChart scores={compareData.a.scores} labels={labels} title={compareData.a.userId.name} />
          </div>
          <div className='bg-white p-4 rounded shadow'>
            <h3 className='font-bold'>{compareData.b.userId.name}</h3>
            <RadarChart scores={compareData.b.scores} labels={labels} title={compareData.b.userId.name} />
          </div>
        </div>
      )}
    </div>
  )
}
