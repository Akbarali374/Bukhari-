import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi, gradesApi, newsApi } from '../api';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [bonuses, setBonuses] = useState({ list: [], totalBonus: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ gmail: '', familya: '', ism: '', phone: '', currentPassword: '', newPassword: '' });
  const [news, setNews] = useState([]);

  const studentId = user?.student?.id;

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const [p, g, b, n] = await Promise.all([
        profileApi.get(),
        gradesApi.getGrades(studentId),
        gradesApi.getBonuses(studentId),
        newsApi.list()
      ]);
      setProfile(p.profile);
      setGrades(g);
      setBonuses(b);
      setNews(n);
      setEditForm({
        gmail: p.profile?.gmail || '',
        familya: p.profile?.familya || '',
        ism: p.profile?.ism || '',
        phone: p.profile?.phone || '',
        currentPassword: '',
        newPassword: ''
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [studentId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await profileApi.update({
        gmail: editForm.gmail,
        familya: editForm.familya,
        ism: editForm.ism,
        phone: editForm.phone,
        ...(editForm.newPassword && { currentPassword: editForm.currentPassword, newPassword: editForm.newPassword })
      });
      setEditMode(false);
      setSuccess('Profil yangilandi.');
      refreshUser();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  const avgGrade = grades.length ? Math.round(grades.reduce((s, g) => s + g.value, 0) / grades.length) : null;
  const monthNames = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-enter">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 section-enter">Mening sahifam</h1>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm">
          {success}
        </div>
      )}

      {/* Yangiliklar */}
      {news.length > 0 && (
        <div className="card p-4 sm:p-6 section-enter">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4 flex items-center gap-2">
            📰 Yangiliklar
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {news.slice(0, 10).map((item) => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm sm:text-base">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{item.content}</p>
                {item.image_url && (
                  <img src={item.image_url} alt="" className="mt-2 rounded-lg max-h-24 object-cover w-full max-w-[200px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profil kartochkasi */}
      <div className="card p-4 sm:p-6 section-enter">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400">👤</span>
              Profil
            </h2>
            {!editMode ? (
              <div className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
                <p><span className="text-slate-500 dark:text-slate-400 font-medium">Ism:</span> {profile?.ism}</p>
                <p><span className="text-slate-500 dark:text-slate-400 font-medium">Familya:</span> {profile?.familya}</p>
                <p><span className="text-slate-500 dark:text-slate-400 font-medium">Gmail:</span> {profile?.gmail}</p>
                <p><span className="text-slate-500 dark:text-slate-400 font-medium">Login (email):</span> {profile?.email}</p>
                <p><span className="text-slate-500 dark:text-slate-400 font-medium">Guruh:</span> {profile?.group_name || '—'}</p>
                {profile?.phone && <p><span className="text-slate-500 dark:text-slate-400 font-medium">Telefon:</span> {profile.phone}</p>}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 max-w-sm">
                <input className="input-field" placeholder="Ism" value={editForm.ism} onChange={(e) => setEditForm((f) => ({ ...f, ism: e.target.value }))} required />
                <input className="input-field" placeholder="Familya" value={editForm.familya} onChange={(e) => setEditForm((f) => ({ ...f, familya: e.target.value }))} required />
                <input className="input-field" type="email" placeholder="Gmail" value={editForm.gmail} onChange={(e) => setEditForm((f) => ({ ...f, gmail: e.target.value }))} required />
                <input className="input-field" placeholder="Telefon" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                <input className="input-field" type="password" placeholder="Yangi parol (ixtiyoriy)" value={editForm.newPassword} onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))} />
                {editForm.newPassword && (
                  <input className="input-field" type="password" placeholder="Joriy parol" value={editForm.currentPassword} onChange={(e) => setEditForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Bekor</button>
                  <button type="submit" className="btn-primary flex-1">Saqlash</button>
                </div>
              </form>
            )}
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="btn-secondary shrink-0">
              Tahrirlash
            </button>
          )}
        </div>
      </div>

      {/* Baholar va bonuslar */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4 flex items-center gap-2">
            <span>📊</span> Baholar (1–100)
          </h2>
          {avgGrade !== null && (
            <div className="mb-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">O'rtacha baho</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{avgGrade} <span className="text-lg font-normal text-slate-500 dark:text-slate-400">/ 100</span></p>
            </div>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {grades.slice(0, 20).map((g) => (
              <div key={g.id} className="flex items-center justify-between py-3 sm:py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 min-h-[44px]">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base">{g.subject || 'Baho'}</span>
                  {(g.month && g.year) && (
                    <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm ml-2">{monthNames[g.month - 1]} {g.year}</span>
                  )}
                </div>
                <span className={`font-bold shrink-0 ml-2 text-base sm:text-sm ${g.value >= 60 ? 'text-green-600 dark:text-green-400' : g.value >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                  {g.value}
                </span>
              </div>
            ))}
            {!grades.length && <p className="text-slate-500 dark:text-slate-400 py-4">Hali baholar yo'q.</p>}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4 flex items-center gap-2">
            <span>⭐</span> Bonus ballar
          </h2>
          <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Jami bonus</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">+{bonuses.totalBonus}</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bonuses.list.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-700">{b.reason || 'Bonus'}</span>
                <span className="font-semibold text-amber-600">+{b.amount}</span>
              </div>
            ))}
            {!bonuses.list.length && <p className="text-slate-500 py-4">Hali bonuslar yo'q.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
