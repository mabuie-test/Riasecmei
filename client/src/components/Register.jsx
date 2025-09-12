import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const navigate = useNavigate()
  async function submit(e){
    e.preventDefault()
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    }catch(err){
      alert(err.response?.data?.message || 'Registration failed')
    }
  }
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form onSubmit={submit} className='bg-white p-8 rounded shadow w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6'>Registar</h2>
        <label className='block mb-2'>Nome</label>
        <input className='border p-2 w-full mb-4' value={name} onChange={e=>setName(e.target.value)} />
        <label className='block mb-2'>Email</label>
        <input className='border p-2 w-full mb-4' value={email} onChange={e=>setEmail(e.target.value)} />
        <label className='block mb-2'>Senha</label>
        <input type='password' className='border p-2 w-full mb-4' value={password} onChange={e=>setPassword(e.target.value)} />
        <button className='bg-green-600 text-white px-4 py-2 rounded'>Criar conta</button>
      </form>
    </div>
  )
}
