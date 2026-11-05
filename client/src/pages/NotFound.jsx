import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFound = () => (
  <section className="section">
    <div className="container-premium text-center py-20">
      <h1 className="text-6xl font-bold text-brand-black mb-4">404</h1>
      <p className="text-brand-muted mb-8">Page not found.</p>
      <Button asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  </section>
);
