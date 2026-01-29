import { useState, useEffect } from 'react';
import { adminApi, emailApi, newsApi } from '../api';

const tabs = [
  { id: 'teachers', label: 'Ustozlar', icon: '👨‍🏫' },
  { id: 'groups', label: 'Guruhlar', icon: '👥' },
  { id: 'students', label: 'O\'quvchilar', icon: '📚' },
  { id: 'logins', label: 'Loginlar', icon: '🔑' },
  { id: 'news', label: 'Yangiliklar', icon: '📰' },
  { id: 'reports', label: 'Oylik hisobot', icon: '📧' }
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [filterGroup, setFilterGroup] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [news, setNews] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, g, s, l, n] = await Promise.all([
        adminApi.teachers(),
        adminApi.groups(),
        adminApi.students(),
        adminApi.logins(),
        newsApi.list()
      ]);
      setTeachers(t);
      setGroups(g);
      setStudents(s);
      setLogins(l);
      setNews(n);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 section-enter">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Boshqaruv paneli</h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto section-enter">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'teachers' && (
        <section className="card p-4 sm:p-6 section-enter">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ustozlar</h2>
            <button onClick={() => setModal({ type: 'teacher' })} className="btn-primary">
              + Ustoz qo'shish
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Yuklanmoqda…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-left text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-2">Ism</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2 hidden sm:table-cell">Telefon</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{t.first_name} {t.last_name}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{t.email}</td>
                      <td className="py-3 px-2 hidden sm:table-cell text-slate-600 dark:text-slate-400">{t.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!teachers.length && <p className="py-6 text-center text-slate-500">Ustozlar yo'q.</p>}
            </div>
          )}
        </section>
      )}

      {tab === 'groups' && (
        <section className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Guruhlar</h2>
            <button onClick={() => setModal({ type: 'group', groups, teachers })} className="btn-primary">
              + Guruh yaratish
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Yuklanmoqda…</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-semibold text-primary-800">{g.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">Ustoz: {g.teacher_name}</p>
                  <p className="text-sm text-slate-500">O'quvchilar: {g.student_count}</p>
                </div>
              ))}
              {!groups.length && <p className="col-span-full py-6 text-center text-slate-500">Guruhlar yo'q.</p>}
            </div>
          )}
        </section>
      )}

      {tab === 'students' && (
        <section className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">O'quvchilar</h2>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="input-field w-auto max-w-[200px] py-2"
              >
                <option value="">Barcha guruhlar</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setModal({ type: 'student', groups })} className="btn-primary">
              + O'quvchi qo'shish
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Yuklanmoqda…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 px-2">Familya, Ism</th>
                    <th className="py-3 px-2">Gmail</th>
                    <th className="py-3 px-2">Guruh</th>
                    <th className="py-3 px-2">Login (email)</th>
                  </tr>
                </thead>
                <tbody>
                  {(filterGroup ? students.filter((s) => s.group_id === parseInt(filterGroup, 10)) : students).map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium">{s.familya} {s.ism}</td>
                      <td className="py-3 px-2">{s.gmail}</td>
                      <td className="py-3 px-2">{s.group_name}</td>
                      <td className="py-3 px-2">{s.login_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!students.length && <p className="py-6 text-center text-slate-500">O'quvchilar yo'q.</p>}
            </div>
          )}
        </section>
      )}

      {tab === 'news' && (
        <section className="card p-4 sm:p-6 section-enter">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Yangiliklar</h2>
            <button onClick={() => setModal({ type: 'news' })} className="btn-primary">
              + Yangilik qo'shish
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Masalan: &quot;CEFR imtihonidan B2 oldi o'quvchi&quot; — sarlavha va matn, ixtiyoriy rasm (URL).
          </p>
          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{item.content}</p>
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover w-full max-w-xs" />
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      {new Date(item.created_at).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('O\'chirilsinmi?')) return;
                      try {
                        await newsApi.delete(item.id);
                        setNews((prev) => prev.filter((x) => x.id !== item.id));
                        showSuccess('O\'chirildi.');
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                    className="btn-secondary text-sm py-1.5 px-3 shrink-0"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
            {!news.length && <p className="py-6 text-center text-slate-500 dark:text-slate-400">Yangiliklar yo'q.</p>}
          </div>
        </section>
      )}

      {tab === 'logins' && (
        <section className="card p-4 sm:p-6 section-enter">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Barcha loginlar (ustoz va o'quvchi)</h2>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Yuklanmoqda…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 px-2">Rol</th>
                    <th className="py-3 px-2">Login (email)</th>
                    <th className="py-3 px-2">Ism</th>
                    <th className="py-3 px-2 hidden sm:table-cell">Guruh</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === 'teacher' ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.role === 'teacher' ? 'Ustoz' : 'O\'quvchi'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono">{u.email}</td>
                      <td className="py-3 px-2">{u.first_name} {u.last_name}</td>
                      <td className="py-3 px-2 hidden sm:table-cell">{u.group_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!logins.length && <p className="py-6 text-center text-slate-500">Loginlar yo'q.</p>}
            </div>
          )}
        </section>
      )}

      {tab === 'reports' && (
        <section className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Oylik hisobot (Gmailga yuborish)</h2>
          <p className="text-slate-600 text-sm mb-4">
            Har bir o'quvchiga "Hurmatli o'quvchi" deb natijasi Gmailga yuboriladi. Oxirida "Hurmat bilan, Bukhari Academy".
          </p>
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Oy</label>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(parseInt(e.target.value, 10))}
                className="input-field w-40"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                  <option key={m} value={m}>
                    {['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'][m-1]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yil</label>
              <input
                type="number"
                value={reportYear}
                onChange={(e) => setReportYear(parseInt(e.target.value, 10))}
                className="input-field w-28"
                min="2020"
                max="2030"
              />
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const r = await emailApi.sendAllMonthlyReports(reportMonth, reportYear);
                  showSuccess(r.message);
                } catch (e) {
                  setError(e.message);
                } finally {
                  setLoading(false);
                }
              }}
              className="btn-primary"
              disabled={loading}
            >
              Barcha o'quvchilarga yuborish
            </button>
          </div>
          <p className="text-slate-500 text-xs">
            Email yuborish uchun server .env da SMTP_USER va SMTP_PASS (Gmail App password) o'rnating.
          </p>
        </section>
      )}

      {modal?.type === 'teacher' && (
        <TeacherModal
          onClose={() => setModal(null)}
          onSuccess={() => { load(); setModal(null); showSuccess('Ustoz qo\'shildi.'); }}
        />
      )}
      {modal?.type === 'group' && (
        <GroupModal
          teachers={modal.teachers}
          onClose={() => setModal(null)}
          onSuccess={() => { load(); setModal(null); showSuccess('Guruh yaratildi.'); }}
        />
      )}
      {modal?.type === 'student' && (
        <StudentModal
          groups={modal.groups}
          onClose={() => setModal(null)}
          onSuccess={() => { load(); setModal(null); showSuccess('O\'quvchi qo\'shildi.'); }}
        />
      )}
      {modal?.type === 'news' && (
        <NewsModal
          onClose={() => setModal(null)}
          onSuccess={() => { load(); setModal(null); showSuccess('Yangilik qo\'shildi.'); }}
        />
      )}
    </div>
  );
}

function NewsModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image_url, setImage_url] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await newsApi.create({ title, content, image_url: image_url || undefined });
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Yangilik qo&apos;shish</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Sarlavha (masalan: CEFR imtihonidan B2 oldi o'quvchi)" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="input-field min-h-[100px]" placeholder="Matn (yangilik haqida)" value={content} onChange={(e) => setContent(e.target.value)} required />
          <input className="input-field" placeholder="Rasm URL (ixtiyoriy)" type="url" value={image_url} onChange={(e) => setImage_url(e.target.value)} />
          {err && <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? '…' : 'Qo\'shish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await adminApi.createTeacher({ email, password, first_name, last_name, phone });
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Ustoz qo'shish</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Email (login)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" placeholder="Parol" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          <input className="input-field" placeholder="Ism" value={first_name} onChange={(e) => setFirst_name(e.target.value)} required />
          <input className="input-field" placeholder="Familya" value={last_name} onChange={(e) => setLast_name(e.target.value)} required />
          <input className="input-field" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? '…' : 'Qo\'shish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupModal({ teachers, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [teacher_id, setTeacher_id] = useState(teachers[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await adminApi.createGroup({ name, teacher_id: parseInt(teacher_id, 10) });
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Guruh yaratish</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Guruh nomi" value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="input-field" value={teacher_id} onChange={(e) => setTeacher_id(e.target.value)} required>
            <option value="">Ustoz tanlang</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? '…' : 'Yaratish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentModal({ groups, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gmail, setGmail] = useState('');
  const [familya, setFamilya] = useState('');
  const [ism, setIsm] = useState('');
  const [group_id, setGroup_id] = useState(groups[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await adminApi.createStudent({ email, password, gmail, familya, ism, group_id: parseInt(group_id, 10), phone });
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">O'quvchi qo'shish (login yaratish)</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Login (email) — tizimga kirish uchun" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" placeholder="Parol" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          <input className="input-field" placeholder="Gmail — hisobot yuborish uchun" type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} required />
          <input className="input-field" placeholder="Familya" value={familya} onChange={(e) => setFamilya(e.target.value)} required />
          <input className="input-field" placeholder="Ism" value={ism} onChange={(e) => setIsm(e.target.value)} required />
          <select className="input-field" value={group_id} onChange={(e) => setGroup_id(e.target.value)} required>
            <option value="">Guruh tanlang</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <input className="input-field" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? '…' : 'Qo\'shish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
