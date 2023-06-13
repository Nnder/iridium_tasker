require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// базовая клавиатура
// удаление задач
// завершение задачи

// дописать список задач
// изменение задач

// команды для насти

// Лист команд
// профессии
// рабочее время

// запрос на отпуск, ... (работа с датами)
// доработать команды

// для каждого пользователя по его рабочему времяни отправлять уведомления
// начала рабоч дня
// за 30 мин до конца дня
// чето еще

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

const {changeTeam} = require('./commands/user/changeTeam');
bot.onText(/\/changeTeam/, (msg, match) => {
    changeTeam(msg, match);
});

const {profession} = require('./commands/user/profession');
bot.onText(/\/profession/, (msg, match) => {
    profession(msg, match);
});

const {workTime} = require('./commands/user/workTime');
bot.onText(/\/workTime/, (msg, match) => {
    workTime(msg, match);
});



const {addTask} = require('./commands/task/addTask');
bot.onText(/\/addTask/, (msg, match) => {
    addTask(msg, match);
});

const {taskList} = require('./commands/task/taskList');
bot.onText(/\/taskList/, (msg, match) => {
    taskList(msg, match);
});







