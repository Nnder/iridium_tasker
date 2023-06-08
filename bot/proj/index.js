require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

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

