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

const {workTime} = require('./commands/user/workTime');
bot.onText(/\/workTime/, (msg, match) => {
    workTime(msg, match);
});

const {getTaskForToday} = require('./commands/task/getTask');

const {plan} = require('./commands/task/plan');
bot.onText(/\/plan/, async (msg, match) => {

    const chat_id = msg.chat.id;
    const exist = await getTaskForToday(chat_id)

    if (exist !== null) {

        bot.sendMessage(chat_id, exist?.plan)

    } else {

        let options = {
            reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Ввести план на день", callback_data: JSON.stringify({type: "Enter Plan", chat_id: msg.chat.id}) },
                        { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work", chat_id: msg.chat.id}) },
                    ],
                ]
            }
        };

        bot.sendMessage(msg.chat.id, "Доброе утро! Что на сегодня запланировал?", options)

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

            const {type, task_id} = JSON.parse(callbackQuery.data);
            const chat_id = callbackQuery.message.chat.id;
            const message_id = callbackQuery.message.message_id;

            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            bot.answerCallbackQuery(callbackQuery.id)


            try {
                switch (type) {
                    case "Enter Plan":

                        if (await getTaskForToday(chat_id) === null) {
                            task = await tasks.create({
                                "chat_id": chat_id,
                                "date": Date.now(),
                            })
                        }



                        bot.onText(/\.*/gmi , (msg)=>{
                            plan(msg, match)
                            bot.removeTextListener(/\.*/gmi);
                        })

                        bot.sendMessage(chat_id, "Введите план");

                        break;
                    case "Not Work": bot.sendMessage(chat_id, "Не работаю" );
                        break;
                }
            } catch (e){
                bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
            }


        });


    }
});



const {fact} = require('./commands/task/fact');
const {config} = require("dotenv");
bot.onText(/\/fact/, async (msg, match) => {

    const chat_id = msg.chat.id;
    const exist = await getTaskForToday(chat_id)
    if (exist.fact !== null ) {

        bot.sendMessage(chat_id, exist.fact)

    } else {

        let options = {
            reply_markup: JSON.stringify({

                inline_keyboard: [
                    [
                        { text: "Ввести факт", callback_data: JSON.stringify({type: "Enter fact", chat_id: msg.chat.id}) },
                    ],
                ],
            })
        };

        bot.sendMessage(msg.chat.id, "Что сделал за сегодня?", options)

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

            const {type, task_id} = JSON.parse(callbackQuery.data);
            const chat_id = callbackQuery.message.chat.id;
            const message_id = callbackQuery.message.message_id;

            bot.editMessageText("Что сделал зa сегодня?", {
                chat_id: chat_id,
                message_id: callbackQuery.message.message_id,
                reply_markup: {inline_keyboard: []},
            });

            try {
                switch (type) {
                    case "Enter fact":

                        bot.onText(/\.*/gmi , (msg)=>{
                            fact(msg, match)
                            bot.removeTextListener(/\.*/gmi);
                        })



                        // bot.answerCallbackQuery(callbackQuery.id)
                        // bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})


                        bot.sendMessage(chat_id, "Введите факт")

                        break;
                    case "Not Work":
                        bot.sendMessage(chat_id, "Не работаю");
                        break;
                }
            } catch (e){
                bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
            }


        });

    }

});