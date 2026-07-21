import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Lock, LayoutDashboard, ChevronDown, Stethoscope, Home, Menu, X } from 'lucide-react';

function ChangePasswordModal({ onClose, token }: { onClose: () => void; token: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirm) { setError('New passwords do not match.'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Password changed successfully!');
      setTimeout(onClose, 1500);
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-sky-400" /> Change Password
        </h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['Current Password', currentPassword, setCurrentPassword], ['New Password', newPassword, setNewPassword], ['Confirm New Password', confirm, setConfirm]].map(([label, val, setter]: any) => (
            <div key={label as string}>
              <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
              <input type="password" required value={val} onChange={e => setter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition">Update</button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); setDropdownOpen(false); setMobileMenuOpen(false); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/vr-experience', label: 'VR Simulations', icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* ── HEADER ── */}
      <header className="h-16 border-b border-slate-800 glass-dark sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="VR HealthEd" className="h-9 sm:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`hover:text-white transition ${location.pathname === l.to ? 'text-white' : ''}`}>{l.label}</Link>
          ))}
        </nav>

        {/* Right: Profile + hamburger */}
        <div className="flex items-center gap-3">
          {/* Profile (desktop) */}
          {user ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-2 transition">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                <span className="text-sm font-medium text-white max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-4 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">{initials}</div>
                      <div>
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${user.isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-sky-500/20 text-sky-400'}`}>
                      {user.isAdmin ? '⭐ Administrator' : '🎓 Student'}
                    </span>
                  </div>
                  <div className="py-2">
                    {user.isAdmin && (
                      <Link to="/dashboard/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <LayoutDashboard className="w-4 h-4 text-purple-400" /> Admin Dashboard
                      </Link>
                    )}
                    <Link to="/vr-experience" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
                      <Stethoscope className="w-4 h-4 text-sky-400" /> VR Simulations
                    </Link>
                    <button onClick={() => { setShowChangePassword(true); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
                      <Lock className="w-4 h-4 text-amber-400" /> Change Password
                    </button>
                  </div>
                  <div className="border-t border-slate-800 py-2">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition">
              Login
            </Link>
          )}

          {/* Hamburger (mobile) */}
          <button onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-DOWN MENU ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 inset-x-0 z-40 bg-slate-900 border-b border-slate-800 shadow-2xl">
          {/* Nav links */}
          <div className="px-4 py-3 space-y-1 border-b border-slate-800">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${location.pathname === l.to ? 'bg-sky-500/10 text-sky-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                <l.icon className="w-4 h-4" /> {l.label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link to="/dashboard/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition">
                <LayoutDashboard className="w-4 h-4 text-purple-400" /> Admin Dashboard
              </Link>
            )}
          </div>

          {/* User section */}
          {user ? (
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">{initials}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.isAdmin ? '⭐ Admin' : '🎓 Student'}</p>
                </div>
              </div>
              <button onClick={() => { setShowChangePassword(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition">
                <Lock className="w-4 h-4 text-amber-400" /> Change Password
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="px-4 py-4">
              <Link to="/login" className="block w-full text-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition">
                Login / Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-slate-950/60" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Change Password Modal */}
      {showChangePassword && user && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} token={user.token} />
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navLinks.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs transition ${location.pathname === l.to ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <l.icon className="w-5 h-5" />
            <span>{l.label}</span>
          </Link>
        ))}
        {user ? (
          <button onClick={() => setMobileMenuOpen(v => !v)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[9px] font-bold">{initials}</div>
            <span>Profile</span>
          </button>
        ) : (
          <Link to="/login"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs text-sky-400">
            <LogOut className="w-5 h-5" />
            <span>Login</span>
          </Link>
        )}
      </nav>

      <footer className="hidden md:block py-6 border-t border-slate-800 text-center text-sm text-slate-500 mb-0">
        &copy; {new Date().getFullYear()} VR HealthEd. All rights reserved.
      </footer>

      {/* Spacer so content doesn't hide behind bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
