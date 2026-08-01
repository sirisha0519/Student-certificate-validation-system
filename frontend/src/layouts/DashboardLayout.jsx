import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  Award, 
  History, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation based on User Role
  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Students', path: '/admin/students', icon: Users },
    { name: 'Upload Certificate', path: '/admin/upload', icon: FileUp },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Verification Logs', path: '/admin/logs', icon: History },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Certificates', path: '/student/certificates', icon: Award },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  const navLinks = user?.role === 'Admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-white shrink-0 shadow-xl transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <ShieldCheck className="h-8 w-8 text-primary-400" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            CertValidate
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          <aside className="relative flex flex-col w-64 bg-slate-900 text-white shadow-xl z-50 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-primary-400" />
                <span className="font-bold text-md">CertValidate</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 mr-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="font-semibold text-lg text-slate-800 hidden sm:block">
              {user?.role === 'Admin' ? 'Admin Portal' : 'Student Hub'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden xs:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold select-none shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
