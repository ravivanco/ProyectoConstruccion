import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, FileText, Activity, Apple, Bell, LogOut, Calendar, BarChart2, AlertCircle, Menu, Sun, Moon, Monitor } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Activity size={18} /> },
    { name: 'Pacientes', path: '/patients', icon: <Users size={18} /> },
    { name: 'Planes Nutricionales', path: '#', icon: <FileText size={18} /> },
    { name: 'Alimentos y Recetas', path: '#', icon: <Apple size={18} /> },
    { name: 'Seguimiento', path: '#', icon: <BarChart2 size={18} /> },
    { name: 'Alertas', path: '#', icon: <AlertCircle size={18} /> },
    { name: 'Citas', path: '#', icon: <Calendar size={18} /> },
  ];

  const [isPinned, setIsPinned] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  
  const expanded = isPinned || isExpanded;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="flex h-screen bg-background font-sans transition-colors duration-300">
      <aside 
        onMouseEnter={() => !isPinned && setIsExpanded(true)}
        onMouseLeave={() => !isPinned && setIsExpanded(false)}
        className={`bg-surface-sidebar border-r border-border-sidebar flex flex-col hidden md:flex shrink-0 transition-all duration-300 relative ${expanded ? 'w-[260px]' : 'w-[80px] items-center'}`}
      >
        {/* Toggle Pin Botón */}
        <button 
          onClick={() => setIsPinned(!isPinned)}
          className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-muted hover:text-foreground shadow-sm z-10 transition-colors"
        >
          <Menu size={14} />
        </button>

        <div className={`pt-8 pb-4 flex flex-col items-center ${expanded ? '' : 'px-2'}`}>
          <div className="w-10 h-10 text-foreground flex items-center justify-center mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M2 10l10-8 10 8" />
              <line x1="6" y1="14" x2="18" y2="14" strokeWidth="2" />
              <rect x="4" y="11" width="2" height="6" fill="currentColor" stroke="none" />
              <rect x="18" y="11" width="2" height="6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          {expanded && (
            <>
              <h2 className="font-bold text-[18px] text-foreground tracking-wide whitespace-nowrap">DK Fitt</h2>
              <span className="text-[11px] text-muted font-medium tracking-widest mt-0.5 whitespace-nowrap">Panel Clínico</span>
            </>
          )}
        </div>
        
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden ${expanded ? 'px-4' : 'px-2'}`}>
          {navItems.map((item) => {
             const isActive = location.pathname.startsWith(item.path) && item.path !== '#';
             return (
               <a 
                 key={item.name} 
                 href={item.path !== '#' ? item.path : undefined}
                 title={!expanded ? item.name : undefined}
                 onClick={(e) => {
                    if(item.path !== '#') {
                       e.preventDefault();
                       navigate(item.path);
                    }
                 }}
                 className={`flex items-center gap-4 py-3 rounded-full font-medium transition-colors text-[13px] ${expanded ? 'px-5' : 'justify-center w-12 h-12 mx-auto'} ${
                   isActive 
                     ? 'bg-primary/20 text-foreground font-semibold shadow-sm' 
                     : 'text-muted hover:bg-surface-hover hover:text-foreground'
                 }`}
               >
                 <span className="shrink-0">{item.icon}</span> 
                 {expanded && <span className="whitespace-nowrap">{item.name}</span>}
               </a>
             )
          })}
        </nav>
        
        <div className={`p-4 border-t border-border-sidebar flex flex-col gap-2 ${expanded ? 'px-6' : 'items-center px-2'}`}>
          {expanded && (
            <div className="pt-2.5 pb-1.5 w-full">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted select-none mb-1.5 whitespace-nowrap">
                Apariencia
              </p>
              <div className="flex gap-1 w-full">
                {[
                  { value: 'light', icon: <Sun size={14} />, label: 'Claro' },
                  { value: 'dark', icon: <Moon size={14} />, label: 'Oscuro' },
                  { value: 'system', icon: <Monitor size={14} />, label: 'Sistema' }
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    title={label}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded text-[10px] transition-colors ${theme === value ? 'bg-primary/20 text-foreground border border-primary/30' : 'text-muted border border-transparent hover:bg-surface-hover'}`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!expanded && (
            <button 
              onClick={() => {
                 const next = { light: 'dark', dark: 'system', system: 'light' } as const;
                 setTheme(next[theme]);
              }}
              title="Cambiar Tema"
              className="flex items-center justify-center gap-2 py-2 text-muted hover:bg-surface-hover rounded-full font-medium transition-colors text-[13px] w-10 h-10"
            >
              {theme === 'dark' ? <Moon size={16} /> : theme === 'system' ? <Monitor size={16} /> : <Sun size={16} />}
            </button>
          )}

          <button 
            onClick={handleLogout}
            title={!expanded ? "Cerrar Sesión" : undefined}
            className={`flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-500/10 rounded-full font-semibold transition-colors text-[13px] ${expanded ? 'px-4 w-full' : 'w-10 h-10'}`}
          >
            <LogOut size={16} /> {expanded && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background flex flex-col relative transition-colors duration-300">
        <header className="flex justify-end items-center px-10 py-3 mb-2 border-b border-border">
          <div className="flex items-center gap-6">
            <button className="relative text-muted hover:text-foreground transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-foreground font-bold text-sm">
                D
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[13px] font-bold text-foreground leading-none">dkfitt nutricionista</span>
                <span className="text-[11px] text-muted mt-1">Nutriólogo</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="px-10 pb-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
