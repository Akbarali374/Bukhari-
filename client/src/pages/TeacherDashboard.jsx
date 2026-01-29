import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, gradesApi, newsApi } from '../api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({ value: '', subject: '', comment: '' });
  const [bonusForm, setBonusForm] = useState({ amount: '', reason: '' });
  const [news, setNews] = useState([]);

  const teacherId = user?.teacherId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [g, s, n] = await Promise.all([adminApi.groups(), adminApi.students(), newsApi.list()]);
        setGroups(g);
        setStudents(s);
        setNews(n);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
    }
    };
    load();
  }, []);

  const myGroups = groups.filter((g) => g.teacher_id === teacherId);
  const myStudentIds = new Set();
  myGroups.forEach((gr) => {
    students.filter((s) => s.group_id === gr.id).forEach((s) => myStudentIds.add(s.id));
  });
  const myStudents = students.filter((s) => myStudentIds.has(s.id));

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !gradeForm.value || gradeForm.value < 1 || gradeForm.value > 100) return;
    setError('');
    try {
      await gradesApi.addGrade(selectedStudent.id, {
        value: parseInt(gradeForm.value, 10),
        subject: gradeForm.subject || undefined,
        comment: gradeForm.comment || undefined
      });
      setGradeForm({ value: '', subject: '', comment: '' });
      setSelectedStudent(null);
      showSuccess('Baho qo\'shildi.');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddBonus = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !bonusForm.amount) return;
    setError('');
    try {
      await gradesApi.addBonus(selectedStudent.id, {
        amount: parseInt(bonusForm.amount, 10) || 0,
        reason: bonusForm.reason || undefined
      });
      setBonusForm({ amount: '', reason: '' });
      setSelectedStudent(null);
      showSuccess('Bonus qo\'shildi.');
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-enter">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 section-enter">Ustoz paneli</h1>

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

      {news.length > 0 && (
        <div className="card p-4 sm:p-6 section-enter">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4 flex items-center gap-2">
            📰 Yangiliklar
          </h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {news.slice(0, 5).map((item) => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-2">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 sm:p-6 section-enter">
        <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4">Mening guruhlarim</h2>
        {myGroups.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {myGroups.map((g) => (
              <div key={g.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-primary-800 dark:text-primary-400">{g.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">O'quvchilar: {g.student_count}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Sizga guruhlar hali tayinlanmagan.</p>
        )}
      </div>

      <div className="card p-4 sm:p-6 section-enter">
        <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-400 mb-4">Guruhimdagi o'quvchilar</h2>
        {myStudents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 text-left text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-2">Familya, Ism</th>
                  <th className="py-3 px-2">Guruh</th>
                  <th className="py-3 px-2">Harakat</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{s.familya} {s.ism}</td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{s.group_name}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        Baho / Bonus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">O'quvchilar yo'q.</p>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">{selectedStudent.familya} {selectedStudent.ism}</h3>
            <form onSubmit={handleAddGrade} className="space-y-3 mb-6">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Baho qo'shish (1–100)</h4>
              <input className="input-field" type="number" min={1} max={100} placeholder="Baho" value={gradeForm.value} onChange={(e) => setGradeForm((f) => ({ ...f, value: e.target.value }))} required />
              <input className="input-field" placeholder="Fan / mavzu" value={gradeForm.subject} onChange={(e) => setGradeForm((f) => ({ ...f, subject: e.target.value }))} />
              <input className="input-field" placeholder="Izoh" value={gradeForm.comment} onChange={(e) => setGradeForm((f) => ({ ...f, comment: e.target.value }))} />
              <button type="submit" className="btn-primary w-full">Baho qo'shish</button>
            </form>
            <form onSubmit={handleAddBonus} className="space-y-3">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Bonus qo'shish</h4>
              <input className="input-field" type="number" min={0} placeholder="Ball" value={bonusForm.amount} onChange={(e) => setBonusForm((f) => ({ ...f, amount: e.target.value }))} />
              <input className="input-field" placeholder="Sabab" value={bonusForm.reason} onChange={(e) => setBonusForm((f) => ({ ...f, reason: e.target.value }))} />
              <button type="submit" className="btn-secondary w-full">Bonus qo'shish</button>
            </form>
            <button type="button" onClick={() => setSelectedStudent(null)} className="mt-4 w-full py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
