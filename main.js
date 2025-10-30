class SubscriptionCalculator {
    constructor() {
        this.prices = {
            'Старт': 2500,
            'Любитель': 4500,
            'Профи': 7000
        };
        
        this.discounts = {
            '1': 0,
            '3': 0.1,
            '6': 0.15,
            '12': 0.2
        };
        
        this.init();
    }
    
    init() {
        this.createCalculator();
        this.bindEvents();
    }
    
    createCalculator() {
        const calculatorHTML = `
            <div class="calculator">
                <h3>Калькулятор стоимости</h3>
                <div class="calculator-fields">
                    <div class="calc-field">
                        <label>Тарифный план:</label>
                        <select id="calc-plan">
                            <option value="Старт">Старт - 2 500 руб/мес</option>
                            <option value="Любитель">Любитель - 4 500 руб/мес</option>
                            <option value="Профи">Профи - 7 000 руб/мес</option>
                        </select>
                    </div>
                    <div class="calc-field">
                        <label>Срок подписки:</label>
                        <select id="calc-duration">
                            <option value="1">1 месяц</option>
                            <option value="3">3 месяца (-10%)</option>
                            <option value="6">6 месяцев (-15%)</option>
                            <option value="12">12 месяцев (-20%)</option>
                        </select>
                    </div>
                </div>
                <div class="calc-result">
                    <div class="monthly-price">
                        <span>Ежемесячно:</span>
                        <strong id="monthly-amount">2 500 руб</strong>
                    </div>
                    <div class="total-price">
                        <span>Общая стоимость:</span>
                        <strong id="total-amount">2 500 руб</strong>
                    </div>
                    <div class="savings" id="savings">
                        Ваша экономия: <span>0 руб</span>
                    </div>
                </div>
            </div>
        `;
        
        // Вставить после pricing grid
        document.querySelector('.pricing-grid').insertAdjacentHTML('afterend', calculatorHTML);
    }
    
    bindEvents() {
        document.getElementById('calc-plan').addEventListener('change', () => this.calculate());
        document.getElementById('calc-duration').addEventListener('change', () => this.calculate());
        this.calculate();
    }
    
    calculate() {
        const plan = document.getElementById('calc-plan').value;
        const duration = document.getElementById('calc-duration').value;
        
        const monthlyPrice = this.prices[plan];
        const discount = this.discounts[duration];
        const totalMonths = parseInt(duration);
        
        const monthlyWithDiscount = monthlyPrice * (1 - discount);
        const totalPrice = monthlyWithDiscount * totalMonths;
        const savings = (monthlyPrice * totalMonths) - totalPrice;
        
        document.getElementById('monthly-amount').textContent = `${Math.round(monthlyWithDiscount).toLocaleString()} руб`;
        document.getElementById('total-amount').textContent = `${Math.round(totalPrice).toLocaleString()} руб`;
        
        const savingsElement = document.getElementById('savings');
        if (savings > 0) {
            savingsElement.innerHTML = `Ваша экономия: <span>${Math.round(savings).toLocaleString()} руб</span>`;
            savingsElement.style.display = 'block';
        } else {
            savingsElement.style.display = 'none';
        }
    }
}

// Инициализировать после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new SubscriptionCalculator();
});

// Добавить в существующий JS
async function submitSubscription(formData) {
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessMessage(result.message);
            // Можно добавить аналитику
            gtag('event', 'subscription', {
                'plan': formData.plan,
                'duration': formData.duration
            });
        } else {
            showErrorMessage(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Ошибка соединения. Пожалуйста, попробуйте позже.');
    }
}

// Обновить обработчик формы
document.getElementById('subscription-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        plan: document.getElementById('plan').value,
        duration: document.getElementById('duration').value
    };
    
    await submitSubscription(formData);
});
