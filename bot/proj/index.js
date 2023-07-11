require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: {interval: 300, autoStart: true}});
const sequelize = require('./database/db');
const {users,tasks,freeDays} = require('./database/models');
const webAppUrl = process.env.WEB_APP_URL;
const CronJob = require('cron').CronJob;

module.exports = {
    bot,
    webAppUrl,
    CronJob
};


console.log('Бот запущен');
const {canSend} = require("./commands/user/canSend");

const {start} = require('./commands/start');
bot.onText(/\/start/, (msg, match) => {
    start(msg, match);
});

const {info} = require('./commands/user/info');
bot.onText(/\/info/, (msg, match) => {
    canSend(msg.chat.id).then((res)=> {
        if (res){
            info(msg, match);
        } else {
            bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
        }

    })
});

const {getFullPlan} = require("./commands/task/getFullPlan");
bot.onText(/\/week/, (msg, match) => {

    canSend(msg.chat.id).then((res)=>{
        if (res){
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
        } else {
            bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
        }

    })




});


const {getTaskForToday, setUTC} = require('./commands/task/getTask');

const {plan, startPlan} = require('./commands/task/plan');
const {notWork} = require("./commands/notWork/notWork");
const {debt} = require("./commands/task/debt");

bot.onText(/\/plan/, async (msg, match) => {

        if (await canSend(msg.chat.id)) {

            const chat_id = msg.chat.id;
            const exist = await getTaskForToday(chat_id, setUTC(new Date()))

            if (exist !== null && exist?.plan) {

                bot.sendMessage(chat_id, "Ваш план \n" + exist?.plan);
                debt(msg.chat.id, match);

            } else {
                startPlan(chat_id);
            }
        } else {
            bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
        }

});



const {fact, startFact} = require('./commands/task/fact');

bot.onText(/\/fact/, async (msg, match) => {

    if (await canSend(msg.chat.id)) {

        const chat_id = msg.chat.id;
        const exist = await getTaskForToday(chat_id, setUTC(new Date()))
        if (exist === null || exist?.plan === null) {
            bot.sendMessage(chat_id, "Сначала введите план");
        } else if (exist?.fact !== null) {

            bot.sendMessage(chat_id, "Ваш факт \n" + exist?.fact)

        } else {
            startFact(chat_id);
        }

    } else {
        bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
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

        // данные не успели загрузится (макс 64 байта в callback_data)

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
        await task.update({hours: result});

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
    // fid - freeDays id, tid - task id

    const {type, date, id, fid, tid} = JSON.parse(callbackQuery.data);
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

    const regexp = new RegExp(`.*|${chat_id}`, "gmi");

    try {
        switch (type) {
            case "Enter Plan":
                bot.sendMessage(chat_id, "Введите план");



                bot.onText(regexp , async (msg)=>{
                    if (msg.chat.id == chat_id) {
                        await plan(msg, match)
                        bot.removeTextListener(regexp);
                        await debt(msg.chat.id, match);
                    } else {
                        console.log(`${msg.chat.id} - ${chat_id}`);
                    }

                })

                // bot.once("text", async (msg)=>{
                //     await plan(msg, match)
                //     // bot.removeTextListener(/\.*/gmi);
                //     await debt(msg.chat.id, match);
                // })
                break;
            case "Enter fact":
                bot.sendMessage(chat_id, "Введите факт")

                bot.onText(regexp, (msg) => {
                    if (msg.chat.id == chat_id) {
                        fact(msg, match)
                        bot.removeTextListener(regexp);
                    }

                })
                break;
            case "Not Work":

                bot.sendMessage(chat_id, "Не работаю" );
                notWork(msg, await getTaskForToday(chat_id, currentDate));
                break;


            // debt

            // Enter Plan Debt
            case "EPD":

                await bot.editMessageReplyMarkup({inline_keyboard: [[
                        { text: "Ввести Факт", callback_data: JSON.stringify({type: "EFD", id: id, date: date}) },
                    ]]}, {chat_id, message_id})

                let messageWithKeyboard = await bot.sendMessage(chat_id, `Введите план за ${date}`);

                console.log(new Date(date));

                bot.onText(regexp, (msg)=>{
                    if (msg.chat.id == chat_id) {
                        plan(msg, match, new Date(date))
                        // bot.sendMessage(chat_id, msg.text);
                        bot.removeTextListener(regexp);
                    }
                })




                const timer = setTimeout(async ()=>{
                    // из-за того что не могу получить по id сообщение пришлось изворачиватся
                    try {
                        const {message_id} = messageWithKeyboard;
                        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
                    } catch (e) {
                        console.log("Клавиатура уже была изменена")
                    }
                }, 1000*60*60*8);


                break;
                // Enter Fact Debt
            case "EFD":



                // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});

                bot.sendMessage(chat_id, `Введите факт за ${date}`)
                bot.onText(regexp, (msg) => {
                    if (msg.chat.id == chat_id) {
                        fact(msg, match, date)
                        bot.removeTextListener(regexp);
                    }
                })

                break;
            // Not Work Debt
            case "NWP":
                bot.sendMessage(chat_id, `Не работал ${date}` );
                // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});
                notWork(msg, await getTaskForToday(chat_id, date))
                break;




            // Add hours
            case "Full day":

                const user = await users.findOne({where:{chat_id: chat_id}})

                const task = await tasks.findOne({where:{id: tid}})
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


// CRON


async function startCron(){
    const allUsers = await users.findAll({where: {status: true}})

    allUsers.map(async (user)=>{
        console.log(user.work_time)

        const time = user.work_time.split('-');
        const start = time[0].split(':');
        const end = time[1].split(':');



        let startDay = new CronJob(`00 ${start[1]} ${start[0]} * * 1-5`, async ()=>{

            const exist = await getTaskForToday(user.chat_id, setUTC(new Date()))
            if (exist !== null && exist?.plan) {

                bot.sendMessage(user.chat_id, "Ваш план \n"+exist?.plan);
                debt(chat_id, match);

            } else {
                startPlan(user.chat_id)
            }


        })
        startDay.start();

        let endDay = new CronJob(`00 ${end[1]} ${end[0]} * * 1-5`, async ()=>{

            const exist = await getTaskForToday(user.chat_id, setUTC(new Date()))
            if (exist === null || exist?.plan === null) {
                bot.sendMessage(user.chat_id, "Сначала введите план");
            }
            else if (exist?.fact !== null ) {

                bot.sendMessage(user.chat_id, "Ваш факт \n"+exist?.fact)

            } else {
                startFact(user.chat_id)
            }
        })
        endDay.start();
    })
}

startCron()