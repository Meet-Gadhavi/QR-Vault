import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Menu, X, User, LogOut, Moon, Sun, Github, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';


export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userAvatar } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isPublicPage = location.pathname.startsWith('/v/');
  const isDashboard = location.pathname === '/dashboard';
  const isAdminDashboard = location.pathname.toLowerCase() === '/admin-portal-v2008-safe';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );

  if (isPublicPage || isAdminDashboard) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">

        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#0a0a0a] transition-colors duration-300">

      <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">QR Vault</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm transition-colors">Pricing</Link>
              <Link to="/changelog" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm transition-colors">Changelog</Link>
              <Link to="/api" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm transition-colors">API</Link>
              <Link to="/blogs" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm transition-colors">Blogs</Link>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

              <ThemeToggle />
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className={`font-medium text-sm transition-colors ${isDashboard ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                      My Dashboard
                  </Link>
                  <div className="flex items-center gap-4 pl-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 cursor-default overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Sign Out"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login">
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-200 dark:shadow-none">
                        Sign In
                    </button>
                </Link>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button 
                className="p-2 text-gray-600 dark:text-gray-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 px-4 space-y-4 shadow-xl">
             <Link to="/pricing" className="block text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
             <Link to="/changelog" className="block text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Changelog</Link>
             <Link to="/api" className="block text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>API</Link>
             <Link to="/blogs" className="block text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Blogs</Link>
             <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
             
             {isAuthenticated ? (
               <>
                 <Link to="/dashboard" className="block text-primary-600 dark:text-primary-400 font-medium" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium w-full text-left hover:text-red-500"
                 >
                   <LogOut className="w-4 h-4" /> Sign Out
                 </button>
               </>
             ) : (
               <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium mt-4 transition-colors dark:shadow-none">Sign In</button>
               </Link>
             )}
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gradient-to-b from-gray-50/50 to-white dark:from-[#0d0f14]/50 dark:to-[#08080a] border-t border-gray-100 dark:border-white/5 py-16 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-10 md:gap-x-20">
          <div className="col-span-2 md:col-span-2">
             <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                  <QrCode className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">QR Vault</span>
             </div>
             <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-relaxed">
               Securely store and share your files with instantly generated QR codes. Fast, reliable, and accessible anywhere.
             </p>
          </div>
          
          <div>
            <h4 className="font-black text-gray-900 dark:text-white mb-6 text-xs uppercase tracking-widest leading-none">Product</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Pricing</Link></li>
              <li><Link to="/api" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Developer API</Link></li>
              <li><Link to="/blogs" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Our Blog</Link></li>
              {isAuthenticated && <li><Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Dashboard</Link></li>}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 dark:text-white mb-6 text-xs uppercase tracking-widest leading-none">Company</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 dark:text-white mb-6 text-xs uppercase tracking-widest leading-none">Legal</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Terms & Conditions</Link></li>
              <li><Link to="/refund" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 dark:text-white mb-6 text-xs uppercase tracking-widest leading-none">Resources</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <li><Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">FAQ</Link></li>
              <li><Link to="/security" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Security</Link></li>
              <li><Link to="/changelog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:translate-x-1 inline-block">Changelog</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          <p>© {new Date().getFullYear()} QR Vault. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-250" aria-label="GitHub">
              <Github className="w-4.5 h-4.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-250" aria-label="Twitter">
              <Twitter className="w-4.5 h-4.5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-250" aria-label="LinkedIn">
              <Linkedin className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};