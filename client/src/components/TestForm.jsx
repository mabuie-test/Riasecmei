import React, {useState, useEffect} from 'react'
import { QUESTIONS } from '../data/questions'
import axios from 'axios'

export default function TestForm({onSubmit}){
  const [answers, setAnswers] = useState({})

  useEffect(()=>{
    // initialize answers with zeros
    const map = {}
    QUESTIONS.forEach(q=> map[q.id]=0)
    setAnswers(map)
  },[])

  function setVal(id,v){
    setAnswers(prev=> ({...prev, [id]: Number(v)}))
  }

  async function submit(e){
    e.preventDefault()
    // compute sums per key and counts
    const sums = {R:0,I:0,A:0,S:0,E:0,C:0}
    const counts = {R:0,I:0,A:0,S:0,E:0,C:0}
    Object.entries(answers).forEach(([id,val])=>{
      const q = QUESTIONS.find(x=>x.id===id)
      if(!q) return
      sums[q.key]+=Number(val)
      counts[q.key]+=1
    })
    const token = localStorage.getItem('token')
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/profiles/submit`, { sums, counts, rawAnswers: answers }, { headers: { Authorization: `Bearer ${token}` }})
      onSubmit(res.data.profile)
    }catch(err){
      alert(err.response?.data?.message || 'Error saving')
    }
  }

  return (
    <form onSubmit={submit} className='bg-white p-6 rounded shadow space-y-4'>
      <h3 className='text-lg font-bold'>Questionário de Interesses (exemplo)</h3>
      <p className='text-sm text-gray-600'>Responda de 0 (não gosto) a 3 (gosto muito)</p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {QUESTIONS.map(q=> (
          <div key={q.id} className='p-3 border rounded'>
            <div className='font-medium'>{q.text}</div>
            <div className='mt-2'>
              <select value={answers[q.id]} onChange={e=>setVal(q.id, e.target.value)} className='border p-1'>
                <option value={0}>0 - Não gosto</option>
                <option value={1}>1 - Gosto pouco</option>
                <option value={2}>2 - Gosto moderado</option>
                <option value={3}>3 - Gosto muito</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-end'>
        <button className='bg-blue-600 text-white px-4 py-2 rounded'>Enviar</button>
      </div>
    </form>
  )
}
