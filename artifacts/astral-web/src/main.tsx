import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// When deployed to Vercel (or any host separate from the API server),
// set VITE_API_BASE_URL to override this default, e.g.:
//   VITE_API_BASE_URL=https://my-api.replit.app
// When running locally in the monorepo the relative /api path works fine.
const DEFAULT_API_BASE_URL = 'https://animeastral.qzz.io';
const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL;
setBaseUrl(apiBase);

createRoot(document.getElementById('root')!).render(<App />);
