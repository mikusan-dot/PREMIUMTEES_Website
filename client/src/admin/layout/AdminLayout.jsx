import { Outlet } from 'react-router-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Ticket, Tags, CreditCard, Users, BarChart3, Settings, LogOut } from 'lucide-react';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-brand-white">
        <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4">
          <Link to="/admin/dashboard" className="font-serif text-xl font-bold text-brand-black tracking-tighter">
            ADMIN<span className="text-amber-600">TEES</span>
          </Link>
        </div>
        <div className="mt-6 space-y-1 px-3">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href === '/admin/dashboard' && pathname === '/admin');
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? 'bg-brand-black text-brand-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <button
            onClick={() => { localStorage.removeItem('pt_admin_token'); localStorage.removeItem('pt_admin_user'); navigate('/admin/login'); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
};
