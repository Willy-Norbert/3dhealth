import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Populate email if passed from registration
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address first.');
      return;
    }
    
    setIsResending(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('idle');
        setMessage('');
        alert('A new verification code has been sent to your email!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to resend code');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;

    setStatus('loading');
    setMessage('Verifying your code...');

    try {
      const res = await fetch(`http://localhost:5000/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The code may be invalid or expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred during verification.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-dark text-white rounded-3xl shadow-2xl border border-white/20 text-center">
        <img src="/logo.png" alt="VR HealthEd" className="h-16 w-auto object-contain mx-auto mb-6" />
        
        <h2 className="text-3xl font-bold mb-6">Verify Your Email</h2>
        
        {status === 'idle' || status === 'loading' || status === 'error' ? (
          <>
            <p className="text-blue-200 mb-6 text-sm">
              Enter your email address and the 6-digit code we sent you to verify your account.
            </p>

            {status === 'error' && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 text-left">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  placeholder="student@university.edu"
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
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="submit"
                  disabled={status === 'loading' || isResending}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || status === 'loading'}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition border border-white/20 disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </form>
            
            <p className="mt-6 text-center text-sm text-blue-200">
              <Link to="/login" className="text-white hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-lg text-green-100 mb-6">{message}</p>
            <Link 
              to="/login"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.5)] block"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
