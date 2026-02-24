import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const IMG1_PATH = '/Users/claw/.gemini/antigravity/brain/e9105e5a-96f5-46b9-a640-dc3e89a6d527/uploaded_media_1771880784906.img';
const IMG2_PATH = '/Users/claw/.gemini/antigravity/brain/e9105e5a-96f5-46b9-a640-dc3e89a6d527/uploaded_media_1771880533340.img';

async function uploadImage(path, name) {
    try {
        const buffer = fs.readFileSync(path);
        const { data, error } = await supabase.storage
            .from('photos')
            .upload(`test-${Date.now()}-${name}.jpg`, buffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (err) {
        console.error('File read error:', err);
        return null;
    }
}

async function run() {
    console.log('Uploading images...');
    const url1 = await uploadImage(IMG1_PATH, 'img1');
    const url2 = await uploadImage(IMG2_PATH, 'img2');

    if (!url1 || !url2) {
        console.error('Failed to upload images, aborting.');
        return;
    }

    const profiles = [
        {
            telegram_id: 10000001,
            first_name: 'Мария',
            last_name: 'Иванова',
            username: 'maria_test',
            age: 20,
            gender: 'female',
            bio: 'Новый тестовый профиль 1',
            interests: ['music', 'art'],
            photo_url: url1,
            photos: [url1],
            is_premium: false,
            last_login: new Date()
        },
        {
            telegram_id: 10000002,
            first_name: 'Кристина',
            last_name: 'Смирнова',
            username: 'kris_test',
            age: 23,
            gender: 'female',
            bio: 'Новый тестовый профиль 2',
            interests: ['travel', 'fitness'],
            photo_url: url2,
            photos: [url2],
            is_premium: false,
            last_login: new Date()
        },
        {
            telegram_id: 10000003,
            first_name: 'Елена',
            last_name: 'Попова',
            username: 'elena_test',
            age: 25,
            gender: 'female',
            bio: 'Новый тестовый профиль 3',
            interests: ['books', 'coffee'],
            photo_url: url1,
            photos: [url1, url2],
            is_premium: true,
            last_login: new Date()
        }
    ];

    console.log('Inserting profiles...');
    for (const p of profiles) {
        const { data, error } = await supabase.from('users').upsert([p], { onConflict: 'telegram_id' });
        if (error) console.error('Error inserting', p.first_name, error);
        else console.log('Successfully inserted', p.first_name);
    }
}

run();
