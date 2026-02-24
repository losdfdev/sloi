import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        age: '',
        gender: '',
        search_gender: '',
        bio: '',
        photo_url: null
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const haptic = window.Telegram?.WebApp?.HapticFeedback;

    const handleNext = () => {
        haptic?.impactOccurred('light');
        setStep(prev => prev + 1);
    };

    const handleChange = (field, value) => {
        haptic?.selectionChanged();
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplete = async () => {
        haptic?.impactOccurred('medium');
        setLoading(true);
        try {
            const payload = {
                ...user,
                first_name: formData.first_name,
                last_name: formData.last_name,
                age: parseInt(formData.age, 10),
                gender: formData.gender,
                search_gender: formData.search_gender,
                bio: formData.bio,
                onboarding_completed: true,
                show_in_search: true
            };
            if (formData.photo_url) {
                // If they already uploaded a photo, we make sure it's saved. But the backend photo endpoint already updates the db.
                // Just to be safe, pass it in.
                payload.photo_url = formData.photo_url;
                payload.photos = [formData.photo_url];
            }
            const response = await apiClient.put(`/api/profiles/${user.id}`, payload);
            updateUser(response.data);
            window.location.href = '/';
        } catch (error) {
            console.error('Error saving onboarding data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        try {
            setUploadingPhoto(true);
            const data = new FormData();
            data.append('photo', file);

            const res = await apiClient.post(`/api/profiles/${user.id}/photo`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // The backend returns updated photos array and photo_url
            setFormData(prev => ({ ...prev, photo_url: res.data.photo_url }));
        } catch (err) {
            console.error('Upload Error', err);
            alert('Ошибка при загрузке фото');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return formData.age !== '' &&
                    parseInt(formData.age) >= 18 &&
                    formData.first_name.trim() !== '';
            case 2: return formData.gender !== '' && formData.search_gender !== '';
            case 3: return formData.photo_url !== null; // Bio is optional, photo is required
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6 font-sans tracking-tight">
            <div className="w-full max-w-sm absolute top-10">
                <div className="flex justify-between mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-300 ${step >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm text-center">
                        <div className="text-6xl mb-6">🎂</div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter">Расскажите о себе</h2>
                        <p className="text-white/50 mb-8 text-sm placeholder-white">Укажите ваше имя и возраст (от 18 лет).</p>

                        <div className="space-y-4 mb-8">
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="Имя (Обязательно)"
                                className="w-full bg-[#141415] border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-bold focus:outline-none focus:border-indigo-500/50 appearance-none text-white"
                            />
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="Фамилия (Необязательно)"
                                className="w-full bg-[#141415] border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-bold focus:outline-none focus:border-indigo-500/50 appearance-none text-white"
                            />
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                placeholder="Возраст"
                                className="w-full bg-[#141415] border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl font-bold focus:outline-none focus:border-indigo-500/50 appearance-none text-white"
                            />
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm text-center">
                        <div className="text-5xl mb-4">👫</div>
                        <h2 className="text-2xl font-black mb-6 tracking-tighter">Расскажите о себе</h2>

                        <div className="mb-6">
                            <h3 className="text-sm text-white/50 uppercase tracking-widest font-bold mb-3">Я...</h3>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => handleChange('gender', 'male')}
                                    className={`flex-1 py-3 rounded-2xl border ${formData.gender === 'male' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-[#141415] border-white/10 text-white'} transition flex items-center justify-center gap-2 font-bold`}
                                >
                                    <span>👨</span> Парень
                                </button>
                                <button
                                    onClick={() => handleChange('gender', 'female')}
                                    className={`flex-1 py-3 rounded-2xl border ${formData.gender === 'female' ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-[#141415] border-white/10 text-white'} transition flex items-center justify-center gap-2 font-bold`}
                                >
                                    <span>👩</span> Девушка
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm text-white/50 uppercase tracking-widest font-bold mb-3">Ищу...</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleChange('search_gender', 'female')}
                                    className={`w-full py-3 rounded-2xl border ${formData.search_gender === 'female' ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-[#141415] border-white/10 text-white'} transition flex items-center justify-center gap-2 font-bold`}
                                >
                                    <span>👩</span> Девушек
                                </button>
                                <button
                                    onClick={() => handleChange('search_gender', 'male')}
                                    className={`w-full py-3 rounded-2xl border ${formData.search_gender === 'male' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-[#141415] border-white/10 text-white'} transition flex items-center justify-center gap-2 font-bold`}
                                >
                                    <span>👨</span> Парней
                                </button>
                                <button
                                    onClick={() => handleChange('search_gender', 'all')}
                                    className={`w-full py-3 rounded-2xl border ${formData.search_gender === 'all' ? 'bg-white/10 border-white text-white' : 'bg-[#141415] border-white/10 text-white'} transition flex items-center justify-center gap-2 font-bold`}
                                >
                                    <span>🌈</span> Всех
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm text-center">
                        <h2 className="text-2xl font-black mb-6 tracking-tighter">Оформление профиля</h2>

                        <div className="mb-6 flex flex-col items-center">
                            <div className="w-32 h-32 bg-[#141415] rounded-full overflow-hidden shadow-2xl relative border border-white/10 flex items-center justify-center mb-4">
                                {formData.photo_url ? (
                                    <img src={formData.photo_url} alt="You" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl opacity-50">📸</span>
                                )}
                                {uploadingPhoto && (
                                    <div className="absolute inset-0 bg-[#0A0A0B]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <label className="text-sm bg-indigo-500/20 text-indigo-300 font-bold py-2 px-6 rounded-full cursor-pointer hover:bg-indigo-500/30 transition border border-indigo-500/30">
                                {formData.photo_url ? 'Изменить фото' : 'Загрузить фото (Обязательно)'}
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                            </label>
                        </div>

                        <div className="text-left w-full mt-2">
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="Напишите пару слов о себе (опционально)..."
                                className="w-full bg-[#141415] text-white placeholder-white/30 rounded-2xl px-5 py-4 border border-white/10 focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[100px] resize-none text-sm"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-10 w-full max-w-sm px-6">
                {step < 3 ? (
                    <button
                        disabled={!isStepValid()}
                        onClick={handleNext}
                        className="w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-50 disabled:bg-white/20 disabled:text-white transition"
                    >
                        Далее
                    </button>
                ) : (
                    <button
                        disabled={!isStepValid() || loading}
                        onClick={handleComplete}
                        className="w-full bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 transition"
                    >
                        {loading ? 'Сохранение...' : 'Начать!'}
                    </button>
                )}
            </div>
        </div>
    );
}
