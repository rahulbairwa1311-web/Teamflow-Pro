import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Bell,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ to: '/users', icon: Users, label: 'Team Members' });
  }

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col text-slate-900 font-sans overflow-hidden">
      {/* Top Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">TeamFlow <span className="text-indigo-600">PRO</span></h1>
          </div>
          
          <nav className="hidden lg:flex gap-8 text-sm font-bold text-slate-400">
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className={`py-5 border-b-2 transition-all duration-200 ${
                  location.pathname === item.to 
                    ? 'text-indigo-600 border-indigo-600' 
                    : 'border-transparent hover:text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{user.role} ACCOUNT</span>
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 overflow-hidden">
              {user.name.charAt(0)}
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors tooltip"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Status Bar Footer */}
      <footer className="h-8 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
        <div>Env: Production v1.2.4</div>
        <div>Active User: {user.name}</div>
        <div>{new Date().toLocaleDateString()}</div>
      </footer>
    </div>
  );
};
