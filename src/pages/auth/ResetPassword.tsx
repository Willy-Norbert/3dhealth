import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !password) return;

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setMessage('Resetting password...');
    
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successfully');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password. The code might be invalid or expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-dark text-white rounded-3xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="VR HealthEd" className="h-16 w-auto object-contain mb-4" />
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-blue-200 mt-2 text-center text-sm">
            Enter your email, the 6-digit code we sent you, and your new password.
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {status === 'success' && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm flex flex-col items-center text-center">
            <p>{message}</p>
            <p className="text-xs mt-2 opacity-80">Redirecting to login...</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="student@university.edu"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">6-Digit Code</label>
            <input 
              type="text" 
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition tracking-widest font-mono text-center text-lg"
              placeholder="------"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                placeholder="••••••••"
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                placeholder="••••••••"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-blue-200">
          <Link to="/login" className="text-white font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
