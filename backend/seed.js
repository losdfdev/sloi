import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function seed() {
    const users = [
        {
            telegram_id: 111111111,
            first_name: 'Виктория',
            last_name: '',
            age: 22,
            bio: 'Люблю путешествовать и вкусный кофе ☕️',
            photos: ['https://files.catbox.moe/158qi9.jpg'],
            photo_url: 'https://files.catbox.moe/158qi9.jpg',
            gender: 'female',
            search_gender: 'all',
            min_age: 18,
            max_age: 40,
            created_at: new Date(),
            last_login: new Date()
        },
        {
            telegram_id: 222222222,
            first_name: 'Анна',
            last_name: '',
            age: 24,
            bio: 'Ищу компанию для походов на выставки и концерты 🎶',
            photos: ['https://files.catbox.moe/hoolgt.jpg'],
            photo_url: 'https://files.catbox.moe/hoolgt.jpg',
            gender: 'female',
            search_gender: 'all',
            min_age: 20,
            max_age: 35,
            created_at: new Date(),
            last_login: new Date()
        },
        {
            telegram_id: 333333333,
            first_name: 'Алина',
            last_name: '',
            age: 21,
            bio: 'Развиваюсь, занимаюсь спортом! Буду рада знакомству ✨',
            photos: ['https://files.catbox.moe/27ohpo.jpg'],
            photo_url: 'https://files.catbox.moe/27ohpo.jpg',
            gender: 'female',
            search_gender: 'all',
            min_age: 18,
            max_age: 30,
            created_at: new Date(),
            last_login: new Date()
        }
    ];

    console.log('Seeding profiles...');
    for (const user of users) {
        const { data, error } = await supabase.from('users').upsert(user, { onConflict: 'telegram_id' });
        if (error) {
            console.error('Error inserting', user.first_name, error);
        } else {
            console.log('Successfully inserted', user.first_name);
        }
    }
}

seed();
