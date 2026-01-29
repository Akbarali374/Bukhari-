import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [];
  if (user?.role === 'admin') {
    navItems.push({ path: '/dashboard', label: 'Boshqaruv paneli', icon: '📊' });
  }
  if (user?.role === 'teacher') {
    navItems.push({ path: '/teacher', label: 'Ustoz paneli', icon: '👨‍🏫' });
  }
  if (user?.role === 'student') {
    navItems.push({ path: '/student', label: 'Mening sahifam', icon: '📚' });
  }

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate(navItems[0]?.path || '/')}
              className="flex items-center gap-2 text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-bold text-lg sm:text-xl transition-colors"
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm">B</span>
              <span className="hidden xs:inline">Bukhari Academy</span>
            </button>
            <nav className="hidden sm:flex items-center gap-1 ml-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={dark ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
              aria-label={dark ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <span className="text-slate-600 dark:text-slate-400 text-sm truncate max-w-[120px] sm:max-w-none">
              {user?.first_name} {user?.last_name}
            </span>
            <button
              onClick={logout}
              className="btn-secondary text-sm py-2 px-3"
            >
              Chiqish
            </button>
          </div>
        </div>
        {/* Mobil menyu */}
        <nav className="sm:hidden flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide -mb-px">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                currentPath === item.path
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-1 page-container">
        <Outlet />
      </main>
    </div>
  );
}
