'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import AmbientBackground from '@/components/AmbientBackground';
import { api } from '@/lib/api';

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token was provided.');
      return;
    }
    api
      .post('/auth/verify-email', { token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'This verification link is invalid or has expired.');
      });
  }, [params]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-6 py-16">
      <AmbientBackground density={20} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl p-10 text-center shadow-gold-lg"
      >
        <Logo size={44} />
        <div className="mt-8">
          {status === 'loading' && <Loader2 size={44} className="animate-spin text-gold" />}
          {status === 'success' && <CheckCircle2 size={44} className="text-gold" />}
          {status === 'error' && <XCircle size={44} className="text-red-400" />}
        </div>
        <p className="mt-5 font-display text-2xl font-semibold text-ivory">
          {status === 'loading' ? 'Verifying your email…' : status === 'success' ? 'Email verified' : 'Verification failed'}
        </p>
        <p className="mt-2 max-w-xs text-sm text-slate">{message}</p>
        {status !== 'loading' && (
          <button onClick={() => router.push('/login')} className="btn-gold mt-8">
            Go to Sign In
          </button>
        )}
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
