import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './ORTHFlow.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
