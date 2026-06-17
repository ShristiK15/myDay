import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      googleLogin({
        email: 'demo@myday.app',
        name: 'Demo User',
      }).then(() => navigate(from));
      return;
    }
    window.google?.accounts?.id?.prompt();
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="relative hidden w-1/2 bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-[#4a3728]/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-serif text-2xl italic">MyDay</span>
          </div>
          <div>
            <p className="mb-2 text-xs tracking-[0.3em] uppercase opacity-80">A place to remember</p>
            <p className="font-serif text-4xl italic leading-tight">
              Every page you turn is a day you get to keep.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-white/30 bg-black/30 p-6 backdrop-blur-sm">
            <p className="font-serif text-xl italic">
              &ldquo;Fill your paper with the breathings of your heart.&rdquo;
            </p>
            <p className="mt-2 text-sm opacity-80">— William Wordsworth</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-full flex-col justify-center bg-[#f5f2e9] px-8 py-12 lg:w-1/2 lg:px-16"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-[#4a3728]" />
            <h1 className="font-serif text-4xl font-bold text-[#4a3728]">Welcome Back 👋</h1>
            <p className="mt-1 font-serif italic text-[#6f4e37]">Your journal missed you.</p>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block font-serif text-sm italic text-[#6f4e37]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8a99a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-serif text-sm italic text-[#6f4e37]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8a99a]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8a99a]"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="italic">Remember me</span>
                </label>
                <Link to="/forgot-password" className="italic text-[#6f4e37] underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 font-serif text-lg">
              <ArrowRight className="h-5 w-5" /> Sign In
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#d1c7b7]" />
            <span className="text-sm text-[#b8a99a]">or</span>
            <div className="h-px flex-1 bg-[#d1c7b7]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1c7b7] bg-white py-3 text-sm font-medium"
          >
            <span className="text-lg font-bold text-blue-600">G</span> Continue with Google
          </button>

          <p className="mt-8 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-[#4a3728] underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
