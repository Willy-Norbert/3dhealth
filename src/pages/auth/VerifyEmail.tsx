import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`, {
          method: 'POST',
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during verification.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-dark text-white rounded-3xl shadow-2xl border border-white/20 text-center">
        <img src="/logo.png" alt="VR HealthEd" className="h-16 w-auto object-contain mx-auto mb-6" />
        
        <h2 className="text-3xl font-bold mb-6">Email Verification</h2>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-200">{message}</p>
          </div>
        )}

        {status === 'success' && (
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

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-lg text-red-100 mb-6">{message}</p>
            <Link 
              to="/login"
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition block"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
