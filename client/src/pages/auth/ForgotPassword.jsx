import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#4a3728]" />
        <h1 className="text-center font-serif text-3xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-center text-sm italic opacity-70">We&apos;ll send you a reset link</p>

        {sent ? (
          <p className="mt-6 text-center text-green-800">Check your email for reset instructions.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8a99a]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field !pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
        <Link to="/sign-in" className="mt-6 block text-center text-sm underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
