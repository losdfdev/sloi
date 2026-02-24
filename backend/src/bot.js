import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Make sure it can find the env if run separately

const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot if token is present
export const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
    console.log('🤖 Telegram Bot API initialized for push notifications');

    // Handle /start command
    bot.onText(/^\/start$/, (msg) => {
        const chatId = msg.chat.id;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔥 Открыть Sloi",
                            web_app: { url: process.env.WEBAPP_URL || "https://sloi-frontend.onrender.com" }
                        }
                    ]
                ]
            }
        };

        bot.sendMessage(
            chatId,
            "Добро пожаловать в Sloi! 🖤\n\nНажми кнопку ниже, чтобы начать искать пару и знакомиться.",
            opts
        );
    });

    bot.on('polling_error', (err) => {
        // Ignore polling errors to prevent crash loop if there is a conflict
        console.error('Telegram Bot Polling error:', err.message);
    });
} else {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not provided, bot notifications are disabled.');
}

export const sendNotification = async (telegramId, message) => {
    if (!bot || !telegramId) return;
    try {
        await bot.sendMessage(telegramId, message);
    } catch (error) {
        console.error(`Failed to send notification to ${telegramId}:`, error.message);
    }
};
