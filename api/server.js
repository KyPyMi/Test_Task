const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Подключение к MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Massager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Проверка подключения
db.getConnection()
  .then(() => console.log('✅ Успешное подключение к MySQL'))
  .catch(err => {
    console.error('❌ Ошибка подключения к MySQL:', err.message);
    process.exit(1);
  });

// Получение всех сообщений
app.get('/api/messages', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_GetMessages()');
        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).json({ 
            error: 'Ошибка при получении данных',
            details: error.message 
        });
    }
});

// Сохранение нового сообщения
app.post('/api/messages', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                error: 'Сообщение не может быть пустым' 
            });
        }

        // Вызов процедуры с параметрами
        const [result] = await db.query(
            'CALL sp_AddMessage(?, @new_id, @status)',
            [message.trim()]
        );
        
        // Получаем OUT-параметры
        const [outParams] = await db.query(
            'SELECT @new_id as new_id, @status as status'
        );
        
        if (outParams[0].new_id === 0) {
            // Ошибка валидации из процедуры
            return res.status(400).json({ 
                error: outParams[0].status 
            });
        }
        
        res.status(201).json({
            success: true,
            id: outParams[0].new_id,
            message: outParams[0].status
        });
        
    } catch (error) {
        console.error('Ошибка при сохранении сообщения:', error);
        res.status(500).json({ 
            error: 'Ошибка при сохранении сообщения',
            details: error.message 
        });
    }
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Сервер работает',
    endpoints: {
      getMessages: 'GET /api/messages',
      postMessage: 'POST /api/messages'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});