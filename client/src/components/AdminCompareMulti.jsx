// client/src/components/AdminCompareMulti.jsx
import React, {useEffect, useState} from 'react'
import axios from 'axios'
import OverlayProfiles from './OverlayProfiles'

const COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316','#a78bfa','#06b6d4']

export default function AdminCompareMulti(){
  const [profiles, setProfiles] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=> {
    async function load(){
      const token = localStorage.getItem('token')
      try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profiles/all`, { headers: { Authorization: `Bearer ${token}` }})
        setProfiles(res.data.profiles || [])
      }catch(err){
        alert('Erro: necessita privilégios de admin')
      }
    }
    load()
  },[])

  function toggle(id){
    setSelected(prev => {
      const s = new Set(prev)
      if(s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  async function runCompare(){
    if(selected.size < 2) return alert('Seleciona pelo menos 2 perfis para comparar.')
    const ids = Array.from(selected)
    if(ids.length > 12) return alert('Limite máximo: 12 perfis por comparação (para legibilidade).')
    setLoading(true)
    try{
      const token = localStorage.getItem('token')
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/profiles/compare-multi`, { ids }, { headers: { Authorization: `Bearer ${token}` }})
      setResult(res.data)
    }catch(err){
      alert(err.response?.data?.message || 'Erro ao comparar')
    }finally{ setLoading(false) }
  }

  return (
    <div className='container mx-auto p-6'>
      <h2 className='text-xl font-bold mb-3'>Admin — Comparar / Sobrepor Perfis</h2>
      <div className='grid md:grid-cols-3 gap-4'>
        <div className='md:col-span-1 bg-white p-4 rounded shadow'>
          <h3 className='font-semibold mb-2'>Perfis disponíveis</h3>
          <div className='max-h-80 overflow-auto'>
            {profiles.map(p => (
              <label key={p._id} className='flex items-center gap-2 mb-2'>
                <input type='checkbox' checked={selected.has(p.userId._id)} onChange={()=>toggle(p.userId._id)} />
                <span className='text-sm'>{p.userId.name} <span className='text-xs text-gray-500'>({p.userId.email})</span></span>
              </label>
            ))}
          </div>
          <div className='mt-3'>
            <button className='bg-blue-600 text-white px-3 py-2 rounded' onClick={runCompare} disabled={loading}>
              {loading ? 'A comparar...' : 'Sobrepor selecionados'}
            </button>
            <div className='text-xs text-gray-500 mt-2'>Selecione 2–12 perfis.</div>
          </div>
        </div>

        <div className='md:col-span-2 bg-white p-4 rounded shadow'>
          <h3 className='font-semibold mb-2'>Visualização</h3>
          {result ? (
            <>
              <OverlayProfiles datasets={result.profiles} colors={COLORS} />
              <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-2'>
                <div>
                  <h4 className='font-medium'>Média do grupo</h4>
                  <pre className='text-sm bg-gray-50 p-2 rounded'>{JSON.stringify(result.avg,null,2)}</pre>
                </div>
                <div>
                  <h4 className='font-medium'>Distâncias to avg</h4>
                  <ul className='text-sm'>
                    {result.distancesToAvg.map(d=> <li key={d.id}>{d.name}: {d.distToAvg}</li>)}
                  </ul>
                </div>
              </div>

              <div className='mt-3'>
                <h4 className='font-medium'>Legenda</h4>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {result.profiles.map((p,i)=>(
                    <div key={p.userId} className='flex items-center gap-2 p-1'>
                      <span style={{ width: 14, height: 14, background: COLORS[i % COLORS.length], display:'inline-block', opacity:0.8 }} />
                      <span className='text-sm'>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className='text-sm text-gray-600'>Nenhum resultado. Seleciona perfis e clica em "Sobrepor selecionados".</div>
          )}
        </div>
      </div>
    </div>
  )
}
