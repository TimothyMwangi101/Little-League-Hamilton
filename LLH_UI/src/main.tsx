import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import Auth from './components/auth/Auth.tsx'
import App from './App.tsx'
import Nav from './components/Nav.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col h-dvh">
        <Nav />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Auth />} />
          {/* <Route path="/account" element={<Account />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)