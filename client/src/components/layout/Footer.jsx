import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Categories', href: '/categories' },
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Best Sellers', href: '/best-sellers' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const Footer = () => (
  <footer className="bg-brand-black text-brand-offwhite border-t border-white/10">
    <div className="container-premium py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="font-serif text-2xl font-bold text-white tracking-tighter mb-4 inline-block">
            PREMIUM<span className="text-brand-accent">TEES</span>
          </Link>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Minimalist premium T-shirts crafted for Bangladesh. Quality fabric, timeless fit.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Shop</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {NAV_LINKS.map((l) => (
              <li key={l.name}><Link to={l.href} className="hover:text-white transition-colors">{l.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Support</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="mailto:support@premiumtees.com" className="hover:text-white transition-colors">support@premiumtees.com</a></li>
            <li><a href="tel:+8801700000000" className="hover:text-white transition-colors">+880 1700 000000</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4">Subscribe for updates and new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Enter your email" className="flex-1" />
            <Button variant="outline" size="sm">Subscribe</Button>
          </form>
          <div className="mt-6 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white"><User className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><ShieldCheck className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <div>© {new Date().getFullYear()} Premium Tees. All rights reserved.</div>
        <div className="flex gap-6 text-sm">
          <a href="/about" className="hover:text-white">Privacy Policy</a>
          <a href="/about" className="hover:text-white">Return &amp; Refund</a>
          <a href="/about" className="hover:text-white">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>
  </footer>
);
