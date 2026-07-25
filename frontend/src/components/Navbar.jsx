import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="InsuraX Logo" className="h-10 w-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-wider text-slate-900">
              INSURA<span className="text-sky-600">X</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            {!token ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-sky-600 transition-colors font-medium">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-md font-semibold transition-all shadow-md shadow-sky-600/20"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium ml-4"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
