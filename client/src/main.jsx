import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/css/v4-shims.min.css';
import './styles/style.css';
import './styles/responsive-fixes.css';
import './styles/modern-faq-footer.css';
import './index.css';
import './api/http';
import './styles/auth.css';
import App from './App.jsx';

// No StrictMode: Google Identity Services + renderButton re-inits on double-mount and often leaves a blank area in dev
createRoot(document.getElementById('root')).render(<App />);
