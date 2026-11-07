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
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
