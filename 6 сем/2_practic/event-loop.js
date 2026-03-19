
console.log('1.Запуск приложения "СБ Арбитр"...');

setTimeout(() => {
    console.log('5. Таймер Web API истек: Виджет "AI Referent" загружен.');
}, 0);

new Promise((resolve) => {
    console.log('2.Отправка запроса на авторизацию в "SSPB ID"...');
    resolve('Успешно');
}).then((status) => {
    console.log(`4.Обработка ответа "SSPB ID": Статус "${status}". Права подтверждены.`);
    
    setTimeout(() => {
        console.log('6. Обновление DOM: Отрисовка профиля пользователя.');
    }, 0);
});

console.log('3.Отрисовка базового каркаса страницы...');