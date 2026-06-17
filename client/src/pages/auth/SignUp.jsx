import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    return { checks, score: passed };
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.password !== form.confirm) return setError('Passwords do not match');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) return setError('Please enter a valid email address');
  // if (!agreed) return setError('Please accept the terms');

  const { score, checks } = getPasswordStrength(form.password);
  if (score < 4) {
    const missing = [];
    if (!checks.length)    missing.push('at least 8 characters');
    if (!checks.uppercase) missing.push('an uppercase letter');
    if (!checks.lowercase) missing.push('a lowercase letter');
    if (!checks.number)    missing.push('a number');
    if (!checks.special)   missing.push('a special character (!@#$...)');
    return setError(`Weak password. Please include: ${missing.join(', ')}.`);
  }

  setError('');
  setLoading(true);
  try {
    await register(form.name, form.email, form.password);
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen flex-row-reverse">
      <div
        className="relative hidden w-1/2 bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-[#4a3728]/30" />
        <div className="absolute bottom-10 left-10 right-10 rounded-lg border border-dashed border-[#4a3728]/40 bg-[#f5f2ea]/90 p-6">
          <p className="text-xs tracking-widest text-[#b35a38]">A MYDAY NOTE</p>
          <p className="mt-2 font-serif text-2xl italic text-[#4a3728]">
            &ldquo;Fill your paper with the breathings of your heart.&rdquo;
          </p>
          <p className="mt-2 font-serif text-sm text-[#6f4e37]">— William Wordsworth</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-full flex-col justify-center bg-[#f5f2ea] px-8 py-12 lg:w-1/2 lg:px-16"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4a3728] text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-bold">MyDay</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#4a3728]">Start Your Story</h1>
          <p className="mb-8 font-serif italic text-[#6f4e37]">Every great journey begins with a single page.</p>

          {error && <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: User, type: 'text' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email' },
              { key: 'password', label: 'Password', icon: Lock, type: showPass ? 'text' : 'password' },
              { key: 'confirm', label: 'Confirm Password', icon: Shield, type: showPass ? 'text' : 'password' },
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key}>
                <label className="mb-1 block font-serif text-sm italic">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8a99a]" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input-field !pl-10"
                    required
                    minLength={key.includes('password') ? 6 : undefined}
                  />
                  {key === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {/* <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span>
                I agree to the <a href="#" className="underline">Terms of Service</a> and{' '}
                <a href="#" className="underline">Privacy Policy</a>
              </span>
            </label> */}
            <button type="submit" disabled={loading} className="btn-primary w-full font-serif text-lg">
              Create My Journal
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#d1c7b7]" />
            <span className="text-sm text-[#b8a99a]">or</span>
            <div className="h-px flex-1 bg-[#d1c7b7]" />
          </div>

          <button
            type="button"
            onClick={() =>
              googleLogin({ email: 'demo@myday.app', name: 'Demo User' }).then(() =>
                navigate('/dashboard')
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1c7b7] bg-white py-3"
          >
            <span className="font-bold text-blue-600">G</span> Sign up with Google
          </button>

          <p className="mt-6 text-center text-sm">
            Already have an account? <Link to="/sign-in" className="font-semibold underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
