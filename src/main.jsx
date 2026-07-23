import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dev-only importer inspector at /import-debug (Phase 1 tooling). Lazily loaded
// and gated on DEV so it never ships in a production build or the main bundle.
const ImportDebug = import.meta.env.DEV
  ? lazy(() => import('./importer/debug/ImportDebug.jsx'))
  : null

const isDebugRoute =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  window.location.pathname.replace(/\/$/, '') === '/import-debug'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDebugRoute ? (
      <Suspense fallback={<p style={{ padding: 24 }}>Loading debug…</p>}>
        <ImportDebug />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
