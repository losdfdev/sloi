import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.is_admin) {
            navigate('/');
            return;
        }
        fetchReports();
    }, [user, navigate]);

    const fetchReports = async () => {
        try {
            const res = await apiClient.get('/api/admin/reports', { params: { admin_id: user.id } });
            setReports(res.data || []);
        } catch (err) {
            console.error(err);
            alert('Ошибка доступа в админку');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId, reportedId, actionType) => {
        try {
            await apiClient.post('/api/admin/ban', {
                admin_id: user.id,
                reported_id: reportedId,
                report_id: reportId,
                action: actionType
            });
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err) {
            console.error(err);
            alert('Ошибка выполнения действия');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Загрузка...</div>;

    return (
        <div className="min-h-screen bg-[#0A0A0B] pb-20 font-sans tracking-tight">
            <header className="sticky top-0 z-20 bg-red-900/80 backdrop-blur-xl border-b border-red-500/20 p-4">
                <div className="max-w-sm mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">Admin<span className="text-red-500">.</span></h1>
                        <p className="text-xs text-red-200/50 font-medium tracking-widest uppercase">Панель Модерации</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50"
                    >
                        ✕
                    </button>
                </div>
            </header>

            <main className="max-w-sm mx-auto pt-8 px-4 space-y-4">
                {reports.length === 0 ? (
                    <div className="text-center text-white/50 mt-10">Жалоб пока нет. Все чисто!</div>
                ) : (
                    reports.map(report => (
                        <div key={report.id} className="bg-[#141415] border border-red-500/20 rounded-2xl p-4 text-white">
                            <div className="flex gap-4 mb-4">
                                <img src={report.reported?.photos?.[0] || ''} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-800" />
                                <div>
                                    <h4 className="font-bold">{report.reported?.first_name}</h4>
                                    <p className="text-xs text-white/50 mb-1">ID: <span className="font-mono">{report.reported_id.slice(0, 8)}</span></p>
                                    <p className="text-sm bg-red-500/10 text-red-400 px-2 py-1 rounded inline-block">
                                        От: {report.reporter?.first_name} ({report.reason})
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(report.id, report.reported_id, 'ban')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition">
                                    Забанить 🔨
                                </button>
                                <button onClick={() => handleAction(report.id, report.reported_id, 'dismiss')} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition">
                                    Отклонить
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
