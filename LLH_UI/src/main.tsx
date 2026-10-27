import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import AuthPage from './components/auth/AuthPage.tsx'
import App from './App.tsx'
import Nav from './components/Nav.tsx'
import AccountPage from './components/account/AccountPage.tsx'
import MapPage from './components/map/MapPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col h-dvh">
        <Nav />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)