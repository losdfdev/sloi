import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { motion } from 'framer-motion';

export default function LikesPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await apiClient.get('/api/profiles/likes-me', { params: { user_id: user.id } });
                setLikes(res.data || []);
            } catch (err) {
                if (err.response?.status !== 403) {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };
        if (user?.is_premium) {
            fetchLikes();
        } else {
            setLoading(false);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#0A0A0B] pb-20 font-sans tracking-tight">
            <header className="sticky top-0 z-20 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 p-4">
                <div className="max-w-sm mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">Лайки<span className="text-amber-500">.</span></h1>
                        <p className="text-xs text-amber-200/50 font-medium tracking-widest uppercase">Кто тебя оценил</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors border border-white/5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                </div>
            </header>

            <main className="max-w-sm mx-auto pt-8 px-4">
                {!user?.is_premium ? (
                    <div className="bg-[#141415] border border-amber-500/20 rounded-3xl p-8 text-center text-white relative flex flex-col items-center">
                        <div className="text-5xl mb-6 opacity-90 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">⭐️</div>
                        <h3 className="text-xl font-bold mb-3 tracking-tight">Узнай, кому ты нравишься</h3>
                        <p className="text-sm text-white/50 mb-8 leading-relaxed">
                            Эксклюзивный доступ для <b>Premium</b> пользователей. Смотрите тех, кто вас уже лайкнул, и отвечайте взаимностью!
                        </p>
                        <button onClick={() => navigate('/profile')} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold py-3.5 rounded-2xl hover:scale-105 transition shadow-[0_4px_20px_rgba(251,191,36,0.4)]">
                            Получить Premium
                        </button>
                    </div>
                ) : loading ? (
                    <div className="text-center text-white/50 mt-20 animate-pulse">Загрузка лайков...</div>
                ) : likes.length === 0 ? (
                    <div className="text-center text-white/50 mt-20">
                        <div className="text-4xl mb-4 opacity-50">👀</div>
                        <p>Пока нет новых лайков.<br />Продолжай свайпать и они появятся!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {likes.map((profile, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={profile.id}
                                className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer flex items-end p-3 ${profile.is_super_like ? 'border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'border border-white/10'}`}
                                onClick={() => navigate('/')}
                            >
                                <img src={profile.photos?.[0] || ''} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                                <div className="relative z-20 w-full">
                                    <div className="font-bold text-white text-lg leading-tight flex items-center justify-between">
                                        {profile.first_name}
                                        {profile.is_super_like && <span className="text-amber-400 text-sm">⭐️</span>}
                                    </div>
                                    <div className="text-xs text-white/70">{profile.age} лет</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
