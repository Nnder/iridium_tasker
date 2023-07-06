require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: {interval: 300, autoStart: true}});
const webAppUrl = process.env.WEB_APP_URL;
const CronJob = require('cron').CronJob;

module.exports = {
    bot,
    webAppUrl,
    CronJob
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

const {plan, startPlan} = require('./commands/task/plan');
const {notWork} = require("./commands/notWork/notWork");
bot.onText(/\/plan/, async (msg, match) => {

    const chat_id = msg.chat.id;
    const exist = await getTaskForToday(chat_id, setUTC(new Date()))

    if (exist !== null && exist?.plan) {

        bot.sendMessage(chat_id, "Ваш план \n"+exist?.plan);
        debt(msg, match);

    } else {
        startPlan(msg);
    }
});



const {fact, startFact} = require('./commands/task/fact');
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
        startFact(msg);


    }
});



// API

const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/web-data', async (req, res) => {
    console.log(req.body);
    try {

        const {cause, message, from, to, user_id} = req.body

        const user = await users.findOne({where:{ chat_id: user_id}})
        const sto = await users.findOne({ where: {role: 3}})



        let {id} = await freeDays.create(
            {
                chat_id: user_id,
                status: false,
                cause: cause,
                message: message,
                from,
                to
            }
        )

        let text = `Уведомление!\n${user.fio.trim()}\nКоманда: ${user.team.trim()}\nПричина: ${cause}\nДата: ${from} - ${to}\n${message}`

        // данные не успели загрузится

        // C - confirm, R - refuse

        let keyboard = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Подтвердить", callback_data: JSON.stringify({type: "C", id: user_id, fid: id}) },
                            { text: "Отказать", callback_data: JSON.stringify({type: "R", id: user_id, fid: id}) },
                        ],
                    ],
                }
        };

        console.log(keyboard.reply_markup.inline_keyboard[0][0].callback_data);

        await bot.sendMessage(sto.chat_id, text, keyboard);

        // bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
        //
        //     const {type, id, fid} = JSON.parse(callbackQuery.data);
        //     const chat_id_sto = callbackQuery.message.chat.id;
        //     const message_id = callbackQuery.message.message_id;
        //
        //     await bot.answerCallbackQuery(callbackQuery.id)
        //
        //
        //     switch (type) {
        //         case "C":
        //             const user = await users.findOne({where:{ chat_id: id}})
        //             const lead = await users.findOne({ where: {team: user.team, role: 2}})
        //
        //             const free = await freeDays.findOne({where:{id: fid}})
        //
        //
        //             free.update({
        //                 status: true
        //             })
        //
        //             // проверка на промежуток времени в задаче
        //
        //             // if (new Date(from) <= new Date(task.date) && new Date(to) > new Date(task.date)) {
        //             //     await users.update({ status: false }, {
        //             //         where: {
        //             //             chat_id: chat_id
        //             //         }
        //             //     });
        //             // }
        //
        //
        //
        //
        //             bot.sendMessage(chat_id, "Вы подтвердили запрос")
        //             bot.sendMessage(id, "Запрос подтвержден");
        //             bot.sendMessage(lead.chat_id, "СТО подтвердил запрос\n"+text)
        //
        //             break;
        //         case "R":
        //             bot.sendMessage(chat_id, "Вы отклонили запрос")
        //             bot.sendMessage(id, "Запрос отклонен");
        //             break;
        //     }
        //
        //
        // })


        return res.status(200).json({});
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({})
    }
})


app.post('/web-time', async (req, res) => {
    console.log(req.body);
    try {

        const {from, to, result, user_id, task_id} = req.body

        const task = await tasks.findOne({where:{ id: task_id}})
        task.update({hours: result});

        console.log(result)
        console.log(`${from} ${to}`);


        bot.sendMessage(user_id, `Время работы ${from} - ${to}`);


        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 3000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));




bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    // fid - freeDays id

    const {type, date, id, fid} = JSON.parse(callbackQuery.data);
    const chat_id = callbackQuery.message.chat.id;
    const msg = callbackQuery.message
    const message_id = callbackQuery.message.message_id;

    const currentDate = setUTC(new Date());

    const match = "";

    await bot.answerCallbackQuery(callbackQuery.id)
    await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

    // в каждую клавиатуру номер таймера
    //


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
            case "Enter fact":
                bot.sendMessage(chat_id, "Введите факт")
                bot.onText(/\.*/gmi, (msg) => {
                    fact(msg, match)
                    bot.removeTextListener(/\.*/gmi);
                })
                break;
            case "Not Work":

                bot.sendMessage(chat_id, "Не работаю" );
                notWork(msg, await getTaskForToday(chat_id, currentDate));
                break;


            // debt


            case "Enter Plan Past":

                await bot.editMessageReplyMarkup({inline_keyboard: [[
                        { text: "Ввести Факт", callback_data: JSON.stringify({type: "Enter Fact", chat_id: msg.chat.id, date: date}) },
                    ]]}, {chat_id, message_id})

                bot.sendMessage(chat_id, `Введите план за ${date}`);

                console.log(new Date(date));

                bot.onText(/\.*/gmi , (msg)=>{
                    plan(msg, match, new Date(date))
                    bot.sendMessage(chat_id, msg.text);
                    bot.removeTextListener(/\.*/gmi);
                })

                break;
            case "Enter Fact Past":



                // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});

                bot.sendMessage(chat_id, `Введите факт за ${date}`)
                bot.onText(/\.*/gmi, (msg) => {
                    fact(msg, match, date)
                    bot.removeTextListener(/\.*/gmi);
                })

                break;
            case "Not Work Past":
                bot.sendMessage(chat_id, `Не работал ${date}` );
                // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});
                notWork(msg, await getTaskForToday(chat_id, date))
                break;




            // Add hours
            case "Full day":

                const user = await users.findOne({where:{chat_id: chat_id}})
                const split = user.work_time.split('-');
                const from = split[0].split(':');
                const to = split[1].split(':');

                const time = new Date()
                time.setHours(to[0] - from[0], to[1] - from[1])

                const result = `${time.getHours() > 10 ? time.getHours() : "0" + time.getHours() }:${ time.getMinutes() > 10 ? time.getMinutes() : "0" + time.getMinutes() }`;

                task.update({
                    "hours": result
                })

                bot.sendMessage(chat_id, "Полный день");

                break;
            case "Not full day":
                bot.sendMessage(chat_id, "Не полный день");
                task.update({
                    "hours": 2
                })
                break;



            // API
            case "C":
                const freeUser = await users.findOne({where:{ chat_id: id}})
                const lead = await users.findOne({ where: {team: freeUser.team, role: 2}})

                const free = await freeDays.findOne({where:{id: fid}})


                free.update({
                    status: true
                })

                let text = `Уведомление!\n${freeUser.fio.trim()}\nКоманда: ${freeUser.team.trim()}\nПричина: ${free.cause}\nДата: ${free.from} - ${free.to}\n${free.message}`

                // проверка на промежуток времени в задаче

                // if (new Date(from) <= new Date(task.date) && new Date(to) > new Date(task.date)) {
                //     await users.update({ status: false }, {
                //         where: {
                //             chat_id: chat_id
                //         }
                //     });
                // }




                bot.sendMessage(chat_id, "Вы подтвердили запрос")
                bot.sendMessage(id, "Запрос подтвержден");
                bot.sendMessage(lead.chat_id, "СТО подтвердил запрос\n"+text)

                break;
            case "R":
                bot.sendMessage(chat_id, "Вы отклонили запрос")
                bot.sendMessage(id, "Запрос отклонен");
                break;
        }
    } catch (e){
        bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
        bot.sendMessage(chat_id, e.message);
    }
});