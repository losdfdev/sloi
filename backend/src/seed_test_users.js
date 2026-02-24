import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Load root .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
    { first_name: 'Анна', age: 22, gender: 'female', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80', bio: 'Люблю путешествия и кофе ☕', notifications_enabled: true },
    { first_name: 'Елена', age: 25, gender: 'female', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80', bio: 'Дизайнер, ищу вдохновение и интересного собеседника.', notifications_enabled: true },
    { first_name: 'Катя', age: 20, gender: 'female', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', bio: 'Студентка. Обожаю котиков 🐱', notifications_enabled: true },
    { first_name: 'Мария', age: 28, gender: 'female', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80', bio: 'В поисках серьезных отношений.', notifications_enabled: true },
    { first_name: 'Ольга', age: 24, gender: 'female', photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80', bio: 'Спорт, зож, выставки.', notifications_enabled: true },
    { first_name: 'Александр', age: 27, gender: 'male', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80', bio: 'Программист. Интроверт, но люблю хорошие компании.', notifications_enabled: true },
    { first_name: 'Дмитрий', age: 30, gender: 'male', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80', bio: 'Предприниматель. Всегда в движении.', notifications_enabled: true },
    { first_name: 'Максим', age: 23, gender: 'male', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80', bio: 'Музыкант 🎸', notifications_enabled: true },
    { first_name: 'Иван', age: 26, gender: 'male', photo_url: 'https://images.unsplash.com/photo-1488161628813-04466f872507?w=500&q=80', bio: 'Люблю горы и сноуборд.', notifications_enabled: true },
    { first_name: 'Сергей', age: 29, gender: 'male', photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80', bio: 'Просто ищу с кем классно провести время.', notifications_enabled: true }
];

async function seed() {
    console.log("Seeding test users...");
    let count = 0;
    for (const user of testUsers) {
        const telegram_id = Math.floor(Math.random() * 90000000) + 10000000; // random id
        const { data, error } = await supabase.from('users').insert([{
            ...user,
            telegram_id,
            photos: [user.photo_url],
            search_gender: 'all',
            min_age: 18,
            max_age: 100,
            onboarding_completed: true
        }]);

        if (error) {
            console.error(`Error adding ${user.first_name}:`, error.message);
        } else {
            console.log(`Added ${user.first_name}`);
            count++;
        }
    }
    console.log(`Successfully added ${count} users.`);
}

seed();
