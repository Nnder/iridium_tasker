require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const webAppUrl = 'https://ya.ru';

module.exports = {
    bot,
    webAppUrl
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

const {getFullPlan} = require("./commands/task/getFullPlan");
bot.onText(/\/week/, (msg, match) => {

    let currentDay = setUTC(new Date()).getDay(); //(0-6)

    if (currentDay >= 1){
        let start = setUTC(new Date())
        start.setDate(start.getDate() - (currentDay - 1))
        getFullPlan(msg, start)
    } else {
        let start = setUTC(new Date())
        start.setDate(start.getDate() - (currentDay - 1))
        getFullPlan(msg, start)
    }
});

const {getTaskForToday, setUTC} = require('./commands/task/getTask');

const {plan} = require('./commands/task/plan');
const {notWork} = require("./commands/notWork/notWork");
bot.onText(/\/plan/, async (msg, match) => {

    const chat_id = msg.chat.id;
    const exist = await getTaskForToday(chat_id, setUTC(new Date()))

    if (exist !== null) {

        bot.sendMessage(chat_id, "Ваш план \n"+exist?.plan);
        debt(msg, match);

    } else {

        let options = {
            reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Ввести план на день", callback_data: JSON.stringify({type: "Enter Plan", chat_id: msg.chat.id}) },
                        { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work", chat_id: msg.chat.id}) },
                    ],
                ],
            }
        };

        let messageWithKeyboard = await bot.sendMessage(msg.chat.id, "Доброе утро! Что на сегодня запланировал?", options)

        const currentDate = setUTC(new Date());

        if (await getTaskForToday(chat_id, currentDate) === null) {
            task = await tasks.create({
                "chat_id": chat_id,
                "date": currentDate,
            })



        }

        const timer = setTimeout(()=>{
            const {message_id} = messageWithKeyboard;
            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            bot.sendMessage(chat_id, "Вы не заполнили план");
        }, 1000*60*60*8);

        let countClick = 0;

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

            const {type, task_id} = JSON.parse(callbackQuery.data);
            const chat_id = callbackQuery.message.chat.id;
            const message_id = callbackQuery.message.message_id;

            await bot.answerCallbackQuery(callbackQuery.id)

            ++countClick

            if (countClick === 1) {
                clearTimeout(timer)
                await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

                // создаем задачу на сегодня
                // если выбрано не работаю то задача удаляется



                try {
                    switch (type) {
                        case "Enter Plan":

                            bot.sendMessage(chat_id, "Введите план");

                            bot.onText(/\.*/gmi , async (msg)=>{
                                await plan(msg, match)
                                bot.removeTextListener(/\.*/gmi);
                                await debt(msg, match);
                            })



                            break;
                        case "Not Work":
                            bot.sendMessage(chat_id, "Не работаю" );
                            notWork(msg, await getTaskForToday(chat_id, currentDate));
                            break;
                    }
                } catch (e){
                    bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
                }
            }

        });


    }
});



const {fact} = require('./commands/task/fact');
const {debt} = require("./commands/task/debt");

bot.onText(/\/fact/, async (msg, match) => {

    const chat_id = msg.chat.id;
    const exist = await getTaskForToday(chat_id, setUTC(new Date()))
    if (exist === null || exist?.plan === null) {
        bot.sendMessage(chat_id, "Сначала введите план");
    }
    else if (exist?.fact !== null ) {

        bot.sendMessage(chat_id, "Ваш факт \n"+exist?.fact)

    } else {

        let options = {
            reply_markup: JSON.stringify({

                inline_keyboard: [
                    [
                        { text: "Ввести факт", callback_data: JSON.stringify({type: "Enter fact", chat_id: msg.chat.id}) },
                    ],
                ],
                one_time_keyboard: true
            })
        };


        let messageWithKeyboard = await bot.sendMessage(msg.chat.id, "Что сделал за сегодня?", options);

        const timer = setTimeout(()=>{
            const {message_id} = messageWithKeyboard;
            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            bot.sendMessage(chat_id, "Вы не заполнили факт");
        }, 1000*60*30);

        let countClick = 0;

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {



            const {type, task_id} = JSON.parse(callbackQuery.data);
            const chat_id = callbackQuery.message.chat.id;
            const message_id = callbackQuery.message.message_id;

            // bot.editMessageText("Что сделал зa сегодня?", {
            //     chat_id: chat_id,
            //     message_id: message_id,
            //     reply_markup: {inline_keyboard: []},
            // });
            await bot.answerCallbackQuery(callbackQuery.id)


            ++countClick

            if (countClick === 1) {

                clearTimeout(timer)
                bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

                try {
                    switch (type) {
                        case "Enter fact":
                            bot.sendMessage(chat_id, "Введите факт")

                            bot.onText(/\.*/gmi, (msg) => {
                                fact(msg, match)
                                bot.removeTextListener(/\.*/gmi);
                            })

                            break;
                        case "Not Work":
                            bot.sendMessage(chat_id, "Не работаю");
                            break;
                    }
                } catch (e) {
                    bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
                }

            }


        });

    }
});