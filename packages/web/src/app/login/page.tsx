'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.805.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      // Verificar se existe uma conta guardada com este email (MVP: localStorage)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kc_user');
        const user   = stored ? JSON.parse(stored) : null;
        if (user && user.email === email) {
          router.push('/dashboard');
          return;
        }
        // Sem conta — verificar se há keys criadas (acesso directo com email)
        const keysRes = await fetch('/api/keys');
        const keysData = await keysRes.json();
        if (keysData.keys && keysData.keys.length > 0) {
          // Guardar sessão mínima e entrar
          localStorage.setItem('kc_user', JSON.stringify({ email, name: email.split('@')[0] }));
          router.push('/dashboard');
          return;
        }
        setError('Conta não encontrada. Cria uma conta primeiro.');
      }
    } catch {
      setError('Erro ao iniciar sessão. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>

      {/* Minimal nav */}
      <header style={{ borderBottom: '1px solid #111', padding: '0 clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#00DC82', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 11, fontWeight: 700 }}>K</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Kairos Check</span>
          </Link>
          <Link href="/signup" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>
            No account yet? <span style={{ color: '#00DC82', textDecoration: 'underline' }}>Sign up free</span>
          </Link>
        </div>
      </header>

      {/* Background decorations */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ padding: '48px 24px' }}>

        {/* Left glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 500, height: '100%',
          background: 'radial-gradient(ellipse at -20% 50%, rgba(0,220,130,0.07) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Left shape */}
        <div style={{
          position: 'absolute', top: '10%', left: '-80px', width: 360, height: 500,
          background: 'linear-gradient(135deg, rgba(0,220,130,0.05) 0%, rgba(0,220,130,0.02) 50%, transparent 100%)',
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          filter: 'blur(60px)',
          transform: 'rotate(-15deg)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Right glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 500, height: '100%',
          background: 'radial-gradient(ellipse at 120% 50%, rgba(0,220,130,0.05) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Right shape */}
        <div style={{
          position: 'absolute', top: '15%', right: '-80px', width: 360, height: 500,
          background: 'linear-gradient(225deg, rgba(0,220,130,0.04) 0%, rgba(0,220,130,0.015) 50%, transparent 100%)',
          borderRadius: '40% 60% 30% 70% / 60% 40% 50% 50%',
          filter: 'blur(60px)',
          transform: 'rotate(15deg)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Form */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#111',
              border: '1px solid #222', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: 24, color: '#00DC82' }}>K</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginTop: 24, letterSpacing: '-0.02em' }}>
              Sign in to Kairos
            </h1>
            <p style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              No account yet?{' '}
              <Link href="/signup" style={{ color: '#00DC82', textDecoration: 'underline', cursor: 'pointer' }}>Create one free</Link>
            </p>
          </div>

          {/* OAuth buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Continue with Google', Icon: GoogleIcon },
              { label: 'Continue with GitHub', Icon: GitHubIcon },
            ].map(({ label, Icon }) => (
              <button key={label}
                style={{
                  height: 48, background: '#161616', border: '1px solid #2a2a2a',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, fontSize: 14, fontWeight: 500, color: '#fff', cursor: 'pointer',
                  transition: 'background 150ms, border-color 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1f1f1f'; e.currentTarget.style.borderColor = '#333'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              >
                <Icon />
                <span style={{ fontSize: 13 }}>{label.replace('Continue with ', '')}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
            <span style={{ fontSize: 13, color: '#444' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%', height: 48, background: '#111', border: '1px solid #222',
                  borderRadius: 12, padding: '0 16px', fontSize: 15, color: '#fff', outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,220,130,0.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,220,130,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{
                    width: '100%', height: 48, background: '#111', border: '1px solid #222',
                    borderRadius: 12, padding: '0 44px 0 16px', fontSize: 15, color: '#fff', outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,220,130,0.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,220,130,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 13, color: '#ff4444', background: 'rgba(255,68,68,0.08)', borderRadius: 8, padding: '10px 14px', marginTop: 16 }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            disabled={!canSubmit || loading}
            onClick={handleLogin}
            style={{
              width: '100%', height: 48, borderRadius: 12, marginTop: 24,
              background: canSubmit && !loading ? '#00DC82' : '#111',
              border: canSubmit && !loading ? 'none' : '1px solid #1f1f1f',
              color: canSubmit && !loading ? '#000' : '#333',
              fontSize: 15, fontWeight: 600, cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => { if (canSubmit && !loading) e.currentTarget.style.background = '#00e88a'; }}
            onMouseLeave={e => { if (canSubmit && !loading) e.currentTarget.style.background = '#00DC82'; }}
          >
            {loading ? 'A entrar…' : 'Sign in'}
          </button>

          {/* Legal */}
          <p style={{ fontSize: 12, color: '#333', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" style={{ color: '#444', textDecoration: 'underline' }}>Terms</Link>
            {', '}
            <Link href="/privacy" style={{ color: '#444', textDecoration: 'underline' }}>Privacy Policy</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
