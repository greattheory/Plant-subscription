// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // для отдачи статических файлов

// Обработчик формы
app.post('/api/subscribe', async (req, res) => {
    try {
        const { name, email, phone, plan, duration } = req.body;
        
        // Сохраняем в "базу данных" (файл JSON)
        const subscription = {
            id: Date.now(),
            name,
            email,
            phone,
            plan,
            duration,
            createdAt: new Date().toISOString(),
            status: 'new'
        };
        
        // Здесь можно сохранить в базу данных
        console.log('New subscription:', subscription);
        
        // Отправляем email
        await sendConfirmationEmail(subscription);
        
        res.json({ 
            success: true, 
            message: 'Заявка принята! Мы свяжемся с вами в ближайшее время.',
            subscriptionId: subscription.id
        });
        
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при обработке заявки' 
        });
    }
});

// Функция отправки email
async function sendConfirmationEmail(subscription) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscription.email,
        subject: 'Подтверждение подписки - Зелёная Подписка',
        html: `
            <h2>Спасибо за вашу подписку!</h2>
            <p>Уважаемый(ая) ${subscription.name},</p>
            <p>Мы получили вашу заявку на подписку "${subscription.plan}" сроком на ${subscription.duration} месяц(ев).</p>
            <p>Наш менеджер свяжется с вами в течение 24 часов для подтверждения деталей.</p>
            <br>
            <p>С уважением,<br>Команда Зелёной Подписки</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// Получение статистики (для админки)
app.get('/api/stats', (req, res) => {
    // Здесь можно вернуть базовую статистику
    res.json({
        totalSubscriptions: 150,
        monthlyRevenue: 375000,
        popularPlan: 'Любитель'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
