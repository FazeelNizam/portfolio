import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { db, collection, getDocs } from '../services/firebase'

const DataContext = createContext({
  loading: true,
  error: null,
  data: {
    banner: null,
    about: null,
    projects: [],
    experience: [],
    education: [],
    footer: null,
  },
  refresh: async () => {},
})

export const useSiteData = () => useContext(DataContext)

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({ banner: null, about: null, projects: [], experience: [], education: [], footer: null })

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      // Collections expected: projects, experience, education; singletons could be in a 'settings' collection
      const [projectsSnap, expSnap, eduSnap] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'experience')),
        getDocs(collection(db, 'education')),
      ])
      const projects = projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const experience = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const education = eduSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      setData((prev) => ({ ...prev, projects, experience, education }))
    } catch (err) {
      setError(err?.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const value = useMemo(() => ({ loading, error, data, refresh: fetchAll }), [loading, error, data])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
