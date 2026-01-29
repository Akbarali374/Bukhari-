import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') navigate('/dashboard');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('fetch') || msg.includes('Network') || msg.includes('ulanish')) {
        setError('Server ishlamayapti. Pastdagi qadamni bajaring: Terminalda loyiha papkasida "npm run dev" yozing, keyin brauzerda http://localhost:5173 oching.');
      } else {
        setError(msg || 'Kirishda xatolik. Email va parolni tekshiring.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row page-enter">
      <div className="flex-1 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-6 sm:p-12 order-2 sm:order-1">
        <div className="text-center text-white max-w-md section-enter">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl sm:text-5xl font-bold mb-6">
            B
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Bukhari Academy</h1>
          <p className="text-primary-100 text-sm sm:text-base">
            O'quv markazi boshqaruv tizimi. Admin, ustoz yoki o'quvchi sifatida tizimga kiring.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-900 order-1 sm:order-2 transition-colors">
        <div className="w-full max-w-sm section-enter">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 sm:hidden text-center">
            Tizimga kirish
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email (login)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Loginni kiriting"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Kirilmoqda…' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
