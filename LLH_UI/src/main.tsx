import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<App />} />
        <Route path="*" element={<Navigate replace to="/auth" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
