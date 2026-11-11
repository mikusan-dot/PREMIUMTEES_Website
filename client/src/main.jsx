import { API_BASE_URL } from '@/services/api';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `<div style="padding:2rem;color:red;font-family:monospace;white-space:pre-wrap;background:#fee2e2;border:1px solid #fecaca;border-radius:8px">React Error: ${String(this.state.error?.message ?? this.state.error)}\n${String(this.state.error?.stack ?? '')}</div>`;
      }
      return null;
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Short cache so products added in the admin appear within a minute (and on tab refocus).
      staleTime: 60 * 1000,
      refetchOnWindowFocus: true,
      // Render's free tier spins the API down when idle; the first request can take ~30-50s.
      // Retry with backoff instead of surfacing an error straight away.
      retry: 4,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

// Old hostnames (e.g. the pre-rebrand Render URL) forward to the new site, keeping path & query.
// Configure with VITE_SITE_URL (new site) and VITE_LEGACY_HOSTS (comma-separated old hostnames).
try {
  const legacy = (import.meta.env.VITE_LEGACY_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  const target = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');
  if (target && legacy.includes(window.location.hostname.toLowerCase())) {
    window.location.replace(`${target}${window.location.pathname}${window.location.search}${window.location.hash}`);
  }
} catch { /* ignore */ }

// Wake the API as early as possible (fire-and-forget).
try { fetch(`${API_BASE_URL}/health`, { cache: 'no-store' }).catch(() => {}); } catch { /* ignore */ }

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:2rem;color:red;font-family:monospace;white-space:pre-wrap;background:#fee2e2;border:1px solid #dc2626;border-radius:8px">Mount error: ${String(e.message)}\n${String(e.stack)}</div>`;
  }
}
