import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'If an account with that email exists, a reset link has been sent.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to request password reset.');
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
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="VR HealthEd" className="h-16 w-auto object-contain mb-4" />
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-blue-200 mt-2 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {message}
          </div>
        )}
        {status === 'success' && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {message}
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
              disabled={status === 'loading'}
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-blue-200">
          Remember your password?{' '}
          <Link to="/login" className="text-white font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
