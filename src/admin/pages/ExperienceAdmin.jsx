import React, { useEffect, useState } from 'react'
import { db, collection, getDocs, doc, setDoc } from '../../services/firebase'

const ExperienceAdmin = () => {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ year: '', role: '', company: '', location: '', description: '', skills: '' })

  const load = async () => {
    const snap = await getDocs(collection(db, 'experience'))
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const id = form.id || crypto.randomUUID()
    const payload = { ...form, skills: form.skills ? form.skills.split(',').map(s=>s.trim()) : [] }
    await setDoc(doc(db, 'experience', id), payload)
    setForm({ year: '', role: '', company: '', location: '', description: '', skills: '' })
    await load()
  }

  const edit = (item) => setForm({ ...item, skills: (item.skills||[]).join(', ') })

  return (
    <div className="adminPage">
      <h2>Experience</h2>
      <form onSubmit={save} className="adminForm">
        <input placeholder="Year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} />
        <input placeholder="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} />
        <input placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
        <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input placeholder="Skills (comma separated)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
        <button type="submit">{form.id ? 'Update' : 'Create'}</button>
      </form>
      <ul className="adminList">
        {items.map(it => (
          <li key={it.id} onClick={() => edit(it)}>
            <strong>{it.role}</strong> — {it.company}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ExperienceAdmin
