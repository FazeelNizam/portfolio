import React from 'react'

const ErrorPage = ({ message = 'We couldn\'t load the content right now.' }) => {
  return (
    <section className="errorWrapper" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Something went wrong</h1>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{message}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}>Reload</button>
      </div>
    </section>
  )
}

export default ErrorPage
