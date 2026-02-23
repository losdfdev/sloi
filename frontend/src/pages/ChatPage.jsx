import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (matchId && user) {
      fetchMatchData();
      // TODO: Подключить WebSocket для real-time чата
    }
  }, [matchId, user]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: API запрос для получения данных матча и сообщений
      // Пока это заглушка
      setMatch({
        id: matchId,
        user1_id: user?.id,
        user2: {
          id: 'dummy-id',
          first_name: 'Анна',
          photo_url: null,
        },
      });

      setMessages([
        {
          id: '1',
          sender_id: user?.id,
          text: 'Привет! Как дела?',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          sender_id: 'dummy-id',
          text: 'Привет! 😊 Всё хорошо, спасибо!',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Ошибка при загрузке чата');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      // TODO: API запрос для отправки сообщения
      const message = {
        id: `msg-${Date.now()}`,
        sender_id: user?.id,
        text: newMessage,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-4 text-5xl">💬</div>
          <p className="text-xl font-semibold">Загрузка чата...</p>
        </div>
      </div>
    );
  }

  const partner = match?.user2;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Шапка */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4">
        <div className="max-w-sm mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/matches')}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {partner?.first_name}
            </h1>
            <p className="text-xs text-gray-500">Онлайн</p>
          </div>

          <div className="flex gap-2">
            <button className="text-gray-600 hover:text-gray-900 text-xl">
              ☎️
            </button>
            <button className="text-gray-600 hover:text-gray-900 text-xl">
              📹
            </button>
          </div>
        </div>
      </header>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto max-w-sm mx-auto w-full p-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <div>
              <div className="text-4xl mb-2">💬</div>
              <p>Начните разговор!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === user?.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_id === user?.id
                      ? 'text-white/70'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ввод сообщения */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 bg-white border-t border-gray-200 p-4"
      >
        <div className="max-w-sm mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 flex items-center justify-center transition"
          >
            {sending ? '...' : '→'}
          </button>
        </div>
      </form>
    </div>
  );
}
