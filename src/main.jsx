import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './index.css'
import ThreeAM from './ThreeAM.jsx'

inject()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThreeAM />
  </StrictMode>,
)
