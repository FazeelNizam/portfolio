import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import ProjectsAdmin from './pages/ProjectsAdmin'
import ExperienceAdmin from './pages/ExperienceAdmin'
import EducationAdmin from './pages/EducationAdmin'

const Sidebar = () => (
  <aside className="adminSidebar">
    <nav>
      <ul>
        <li><NavLink to="/admin/projects">Projects</NavLink></li>
        <li><NavLink to="/admin/experience">Experience</NavLink></li>
        <li><NavLink to="/admin/education">Education</NavLink></li>
      </ul>
    </nav>
  </aside>
)

const AdminApp = () => {
  return (
    <BrowserRouter>
      <div className="adminLayout">
        <Sidebar />
        <main className="adminMain">
          <Routes>
            <Route path="/admin/projects" element={<ProjectsAdmin />} />
            <Route path="/admin/experience" element={<ExperienceAdmin />} />
            <Route path="/admin/education" element={<EducationAdmin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default AdminApp
