const express = require('express');

const cors = require('cors');
const pool = require('./db'); // импорт из db.js
const bcrypt = require('bcryptjs');      // Для хэширования пароля
const jwt = require('jsonwebtoken');     // Для токена авторизации
require('dotenv').config();
const secret = process.env.JWT_SECRET;
// Лучше вынести в .env, для начала можешь прописать строкой
fetch("http://localhost:3000/coworkings")
const app = express();
app.use(cors());
app.use(express.json());


// Получить все коворкинги
app.get('/coworkings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Coworkings"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить коворкинг по id
app.get('/coworkings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM "Coworkings" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Коворкинг не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать новый коворкинг
app.post('/coworkings', async (req, res) => {
    try {
        const { name, address, description } = req.body;
        const result = await pool.query(
            'INSERT INTO "Coworkings" (name, address, description) VALUES ($1, $2, $3) RETURNING *',
            [name, address, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить коворкинг по id
app.put('/coworkings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, description } = req.body;
        const result = await pool.query(
            'UPDATE "Coworkings" SET name=$1, address=$2, description=$3 WHERE id=$4 RETURNING *',
            [name, address, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Коворкинг не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить коворкинг по id
app.delete('/coworkings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM "Coworkings" WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Коворкинг не найден' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Получить все бронирования
app.get('/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Bookings"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить бронирование по id
app.get('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM "Bookings" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать бронирование
app.post('/bookings', async (req, res) => {
    try {
        const { user_id, workspace_id, start_time, end_time, status } = req.body;
        const result = await pool.query(
            'INSERT INTO "Bookings" (user_id, workspace_id, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, workspace_id, start_time, end_time, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить бронирование по id
app.put('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, workspace_id, start_time, end_time, status } = req.body;
        const result = await pool.query(
            'UPDATE "Bookings" SET user_id=$1, workspace_id=$2, start_time=$3, end_time=$4, status=$5 WHERE id=$6 RETURNING *',
            [user_id, workspace_id, start_time, end_time, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить бронирование по id
app.delete('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM "Bookings" WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Получить всех пользователей
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Users"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить пользователя по id
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM "Users" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать нового пользователя (без авторизации, только для тестов)
app.post('/users', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const result = await pool.query(
            'INSERT INTO "Users" (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, password, name, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить пользователя по id
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, name, role } = req.body;
        const result = await pool.query(
            'UPDATE "Users" SET email=$1, password=$2, name=$3, role=$4 WHERE id=$5 RETURNING *',
            [email, password, name, role, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить пользователя по id
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM "Users" WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Получить все рабочие места
app.get('/workspaces', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Workspaces"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить рабочее место по id
app.get('/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM "Workspaces" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Рабочее место не найдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать новое рабочее место
app.post('/workspaces', async (req, res) => {
    try {
        const { coworking_id, name, type, price_per_hour } = req.body;
        const result = await pool.query(
            'INSERT INTO "Workspaces" (coworking_id, name, type, price_per_hour) VALUES ($1, $2, $3, $4) RETURNING *',
            [coworking_id, name, type, price_per_hour]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить рабочее место по id
app.put('/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { coworking_id, name, type, price_per_hour } = req.body;
        const result = await pool.query(
            'UPDATE "Workspaces" SET coworking_id=$1, name=$2, type=$3, price_per_hour=$4 WHERE id=$5 RETURNING *',
            [coworking_id, name, type, price_per_hour, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Рабочее место не найдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить рабочее место по id
app.delete('/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM "Workspaces" WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Рабочее место не найдено' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Проверка — не занят ли email
        const existing = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email уже зарегистрирован' });
        }

        // 2. Хэширование пароля
        const hash = await bcrypt.hash(password, 10);

        // 3. Запись пользователя в базу (роль всегда user по умолчанию)
        const result = await pool.query(
            'INSERT INTO "Users" (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, hash, name, "user"]
        );

        // 4. Ответ пользователю
        res.status(201).json({ message: "Пользователь создан", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Попытка входа:", email);

        // 1. Поиск пользователя по email
        const userRes = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.warn("Нет пользователя с таким email:", email);
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }
        const user = userRes.rows[0];

        // 2. Проверка пароля (сравнение с хэшом)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.warn("Пароль не совпал для email:", email);
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        // 3. Генерация JWT-токена
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '12h' }
        );

        console.log("Успешный вход для email:", email);

        // 4. Возвращаем токен клиенту
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error("Ошибка в /login:", err);
        res.status(500).json({ error: err.message });
    }
});

function authMiddleware(roles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Нет токена" });

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, secret);
            // roles — массив допустимых ролей, например ["admin"]
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: "Нет прав доступа" });
            }
            req.user = decoded;
            next();
        } catch {
            return res.status(401).json({ error: "Неверный токен" });
        }
    }
}
app.get('/profile', authMiddleware(), async (req, res) => {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, email, name, role FROM "Users" WHERE id = $1', [userId]);
    res.json({ user: result.rows[0] });
});
// Список бронирований авторизованного пользователя
app.get('/profile/bookings', authMiddleware(), async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT b.id, b.start_time, b.end_time, b.status,
                    w.name AS workspace_name, c.name AS coworking_name
             FROM "Bookings" b
             JOIN "Workspaces" w ON b.worckspace_id = w.id
             JOIN "Coworkings" c ON w.coworking_id = c.id
             WHERE b.user_id = $1
             ORDER BY b.start_time DESC`,
            [userId]
        );
        res.json({ bookings: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/change-password', authMiddleware(), async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const userRes = await pool.query('SELECT * FROM "Users" WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "Пользователь не найден" });
    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(400).json({ error: "Неверный текущий пароль" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Пароль слишком короткий" });
    if (await bcrypt.compare(newPassword, user.password)) {
        return res.status(400).json({ error: "Новый пароль не должен совпадать с предыдущим" });
      }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE "Users" SET password = $1 WHERE id = $2', [hash, userId]);
    res.json({ ok: true });
});
app.listen(3000, () => {
    console.log('Backend API запущен на http://localhost:3000');
});

