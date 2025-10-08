import React, { useEffect, useState } from 'react'
import { db, collection, getDocs, doc, setDoc, updateDoc } from '../../services/firebase'

const ProjectsAdmin = () => {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', type: 'web', description: '', image: '', category: '' })

  const load = async () => {
    const snap = await getDocs(collection(db, 'projects'))
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const id = form.id || crypto.randomUUID()
    await setDoc(doc(db, 'projects', id), { ...form })
    setForm({ title: '', type: 'web', description: '', image: '', category: '' })
    await load()
  }

  const edit = (item) => setForm(item)

  return (
    <div className="adminPage">
      <h2>Projects</h2>
      <form onSubmit={save} className="adminForm">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="embedded">Embedded</option>
          <option value="web">Web</option>
          <option value="design">Design</option>
        </select>
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <button type="submit">{form.id ? 'Update' : 'Create'}</button>
      </form>
      <ul className="adminList">
        {items.map(it => (
          <li key={it.id} onClick={() => edit(it)}>
            <strong>{it.title}</strong> — {it.type}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProjectsAdmin
