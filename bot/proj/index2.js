require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// команды для насти

//

// рабочее время
// запрос на отпуск, ... (работа с датами)

// для каждого пользователя по его рабочему времяни отправлять уведомления
// начала рабоч дня с заполнением плана
// за 30 мин до конца дня с заполнением факта

// -----------

// генерация отчетов
// генерация веб страницы задач
// генерация картинки задач

module.exports = {
    bot
};

const sequelize = require('./database/db');
const {users,tasks,freeDays} = require('./database/models');

console.log('Бот запущен');

const {start} = require('./commands/start');
bot.onText(/\/start/, (msg, match) => {
    start(msg, match);
});

const {info} = require('./commands/user/info');
bot.onText(/\/info/, (msg, match) => {
    info(msg, match);
});

const {workTime} = require('./commands/user/workTime');
bot.onText(/\/workTime/, (msg, match) => {
    workTime(msg, match);
});





const {plan} = require('./commands/task/plan');
bot.onText(/\/plan/, (msg, match) => {

    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: "Ввести план на день", callback_data: JSON.stringify({type: "Enter Plan", chat_id: msg.chat.id}) },
                    { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work", chat_id: msg.chat.id}) },
                ],
            ]
        })
    };

    bot.sendMessage(msg.chat.id, "Доброе утро! Что на сегодня запланировал?", options)

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {

        const {type, task_id} = JSON.parse(callbackQuery.data);
        const chat_id = callbackQuery.message.chat.id;

        try {
            switch (type) {
                case "Enter Plan": plan(msg, match);
                    break;
                case "Not Work": bot.sendMessage(chat_id, "Не работаю");
                    break;
            }
        } catch (e){
            bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
        }
    });
});

const {fact} = require('./commands/task/fact');
bot.onText(/\/fact/, (msg, match) => {
    let options = {
        reply_markup: JSON.stringify({
            remove_keyboard: true,
            hide_keyboard: true,
            one_time_keyboard: true,
            inline_keyboard: [
                [
                    { text: "Ввести факт", callback_data: JSON.stringify({type: "Enter Plan", chat_id: msg.chat.id}) },
                ],
            ],
        })
    };

    bot.sendMessage(msg.chat.id, "Что сделал за сегодня?", options)

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {

        const {type, task_id} = JSON.parse(callbackQuery.data);
        const chat_id = callbackQuery.message.chat.id;
        // console.log(callbackQuery)

        try {
            switch (type) {
                case "Enter Plan":
                    fact(msg, match);
                    bot.deleteMessage(chat_id, callbackQuery.message.message_id);
                    break;
                case "Not Work":
                    bot.sendMessage(chat_id, "Не работаю");
                    bot.deleteMessage(chat_id, callbackQuery.message.message_id);
                    break;
            }
        } catch (e){
            bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
        }
    });
});


const {taskList} = require('./commands/task/taskList');
bot.onText(/\/taskList/, (msg, match) => {
    taskList(msg, match);
});







