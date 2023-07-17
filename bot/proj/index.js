require('dotenv').config({ path: '.env' });
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: {interval: 300, autoStart: true}});
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
const {getTaskForToday, setUTC} = require('./commands/task/getTask');

const {start} = require('./commands/start');
bot.onText(/\/start\b/, async (msg, match) => {
    await start(msg, match);
});

// временная команда clear
bot.onText(/\/clear\b/, async (msg, match) => {
    const chat_id = msg.chat.id;
    const task = await getTaskForToday(chat_id, setUTC(new Date()));
    const user = await users.findOne({where:{chat_id}});

    if (task){
        await task.destroy();
    }

    await user.update({status: true});
    bot.sendMessage(chat_id, "Reseted");
});

const {info} = require('./commands/user/info');
bot.onText(/\/info\b/, async (msg, match) => {
    if (await canSend(msg.chat.id)){
        await info(msg, match);
    } else {
        await bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
    }
});

bot.onText(/\/weekend\b/, async (msg, match) => {
    const chat_id = msg.chat.id;
    if (await canSend(msg.chat.id)){
        const task = await getTaskForToday(chat_id, setUTC(new Date()));
        await notWork(msg, task);
    } else {
        await bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
    }
});

const {getFullPlan} = require("./commands/task/getFullPlan");
bot.onText(/\/week\b/, async (msg, match) => {
    if (await canSend(msg.chat.id)){
        let currentDay = setUTC(new Date()).getDay(); //(0-6)

        if (currentDay >= 1){
            let start = setUTC(new Date())
            start.setDate(start.getDate() - (currentDay - 1))
            await getFullPlan(msg, start)
        } else {
            let start = setUTC(new Date())
            start.setDate(start.getDate() - (currentDay - 1))
            await getFullPlan(msg, start)
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
    }

});

const {plan, startPlan} = require('./commands/task/plan');
const {notWork, canWorkToday} = require("./commands/notWork/notWork");
const {debt} = require("./commands/task/debt");

bot.onText(/\/plan\b/, async (msg, match) => {
        if (await canSend(msg.chat.id)) {

            const chat_id = msg.chat.id;
            const exist = await getTaskForToday(chat_id, setUTC(new Date()))

            if (exist !== null && exist?.plan) {

                let editKeyboard = {
                    reply_markup:
                        {
                            disable_notification: true,
                            inline_keyboard: [
                                [
                                    { text: "Редактировать", callback_data: JSON.stringify({type: "Edit Plan", chat_id: chat_id}) },
                                ],
                            ],
                        }
                }

                const {message_id} = await bot.sendMessage(chat_id, "Ваш план \n" + exist?.plan, editKeyboard);
                await debt(msg.chat.id, match);

                const timer = setTimeout(async ()=>{
                    // из-за того что не могу получить по id сообщение пришлось изворачиваться
                    try {
                        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
                        await bot.sendMessage(chat_id, "Вы не изменили план");
                    } catch (e) {
                        console.log("Клавиатура уже была изменена")
                    }
                }, 1000*60*15);

            } else {
                await startPlan(chat_id);
            }
        } else {
            await bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
        }

});



const {fact, startFact} = require('./commands/task/fact');

bot.onText(/\/fact\b/, async (msg, match) => {
    if (await canSend(msg.chat.id)) {
        const chat_id = msg.chat.id;
        const exist = await getTaskForToday(chat_id, setUTC(new Date()))
        if (exist === null || exist?.plan === null) {
            await bot.sendMessage(chat_id, "Сначала введите план");
        } else if (exist?.fact !== null) {
            let editKeyboard = {
                reply_markup:
                    {
                        disable_notification: true,
                        inline_keyboard: [
                            [
                                { text: "Редактировать", callback_data: JSON.stringify({type: "Edit fact", chat_id: chat_id}) },
                            ],
                        ],
                    }
            }

            const {message_id} = await bot.sendMessage(chat_id, "Ваш факт \n" + exist?.fact, editKeyboard)

            const timer = setTimeout(async ()=>{
                // из-за того что не могу получить по id сообщение пришлось изворачиваться
                try {
                    await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
                    await bot.sendMessage(chat_id, "Вы не изменили факт");
                } catch (e) {
                    console.log("Клавиатура уже была изменена")
                }
            }, 1000*60*15);
        } else {
            await startFact(chat_id);
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Вы не можете отправить команду")
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

        const {cause, msg, from, to, uid, mid, tid} = req.body

        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id: uid, message_id: mid})
        await bot.sendMessage(uid, "Запрос направлен СТО");

        const user = await users.findOne({where:{ chat_id: uid}})
        const sto = await users.findOne({ where: {role: 3}})



        let {id} = await freeDays.create(
            {
                chat_id: uid,
                status: false,
                cause: cause,
                message: msg,
                from,
                to
            }
        )

        let text = `Уведомление!\n${user.fio.trim()}\nКоманда: ${user.team.trim()}\nПричина: ${cause}\nДата: ${from} - ${to}\n${msg}`

        // данные не успели загрузиться (макс 64 байта в callback_data)

        // C - confirm, R - refuse

        let keyboard = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Подтвердить", callback_data: JSON.stringify({type: "C", id: uid, fid: id, tid}) },
                            { text: "Отказать", callback_data: JSON.stringify({type: "R", id: uid, fid: id, tid}) },
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

        const {from, to, result, user_id, task_id, mid} = req.body

        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id: user_id, message_id: mid})

        const task = await tasks.findOne({where:{ id: task_id}})
        await task.update({hours: result});

        console.log(result)
        console.log(`${from} ${to}`);


        await bot.sendMessage(user_id, `Время работы ${from} - ${to}`);


        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 3000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    // fid - freeDays id, tid - task id, mid - message id

    const {type, date, id, fid, tid, mid} = JSON.parse(callbackQuery.data);
    const chat_id = callbackQuery.message.chat.id;
    const msg = callbackQuery.message
    const message_id = callbackQuery.message.message_id;

    const currentDate = setUTC(new Date());

    const match = "";
    
    try{
        await bot.answerCallbackQuery(callbackQuery.id, {cache_time: 0});
    } catch (e) {
        await bot.sendMessage(chat_id, "Ошибка попробуйте отправить запрос снова");
    }
    

    // создаем задачу на сегодня
    // если выбрано не работаю то задача удаляется

    const regexp = new RegExp(`.*|${chat_id}`, "gmi");

    try {
        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

        switch (type) {
            case "Enter Plan":
                await bot.sendMessage(chat_id, "Введите план");

                bot.onText(regexp , async (msg)=>{
                    if (msg.chat.id === chat_id) {
                        await plan(msg)
                        await debt(msg.chat.id);
                        bot.removeTextListener(regexp);
                    } else {
                        console.log(`${msg.chat.id} - ${chat_id}`);
                    }
                })
                break;

            case "Edit Plan":
                await bot.sendMessage(chat_id, "Введите новый план");

                bot.onText(regexp , async (msg)=>{
                    if (msg.chat.id === chat_id) {
                        await plan(msg)
                        bot.removeTextListener(regexp);
                    } else {
                        console.log(`${msg.chat.id} - ${chat_id}`);
                    }

                })
                break;

            case "Enter fact":
                await bot.sendMessage(chat_id, "Введите факт")

                bot.onText(regexp, async (msg) => {
                    if (msg.chat.id === chat_id) {
                        await fact(msg)
                        bot.removeTextListener(regexp);
                    }

                })
                break;

            case "Edit fact":
                await bot.sendMessage(chat_id, "Введите новый факт")

                bot.onText(regexp, async (msg) => {
                    if (msg.chat.id === chat_id) {
                        await fact(msg)
                        bot.removeTextListener(regexp);
                    }
                })
                break;

            case "Not Work":

                await bot.sendMessage(chat_id, "Не работаю" );
                await notWork(msg, await getTaskForToday(chat_id, currentDate));
                break;


            // debt

            // Enter Plan Debt
            case "EPD":
                // await bot.editMessageReplyMarkup({inline_keyboard: [[
                //         { text: "Ввести Факт", callback_data: JSON.stringify({type: "EFD", id: id, date: date}) },
                //     ]]}, {chat_id, message_id})

                let messageWithKeyboard = await bot.sendMessage(chat_id, `Введите план за ${date}`);

                console.log(new Date(date));

                bot.onText(regexp, async (msg)=>{
                    if (msg.chat.id === chat_id) {
                        await plan(msg, match, new Date(date))
                        // bot.sendMessage(chat_id, msg.text);

                        const keyboardFact = {
                            reply_markup:
                                {
                                    disable_notification: true,
                                    inline_keyboard: [
                                        [
                                            { text: "Ввести Факт", callback_data: JSON.stringify({type: "EFD", id: id, date: date}) },
                                        ],
                                    ],
                                }
                        };

                        let messageWithKeyboard = await bot.sendMessage(chat_id, `Введите факт за ${date}`, keyboardFact)


                        const timer = setTimeout(async ()=>{
                            try {
                                const {message_id} = messageWithKeyboard;
                                await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
                            } catch (e) {
                                console.log("Клавиатура уже была изменена")
                            }
                        }, 1000*60*60*2);

                        bot.removeTextListener(regexp);
                    }
                })

                const timer = setTimeout(async ()=>{
                    // из-за того что не могу получить по id сообщение пришлось изворачиваться (просто обернул в try catch)
                    // вылетает ошибка при попытке изменить клавиатуру на такую же пустую клавиатуру
                    // проблему с сообщением как решить понял, но времени на переделку не было
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
                await bot.sendMessage(chat_id, `Введите факт`);
                bot.onText(regexp, async (msg) => {
                    if (msg.chat.id === chat_id) {
                        await fact(msg, "", date)
                        bot.removeTextListener(regexp);
                    }
                })

                break;
            // Not Work Debt
            case "NWD":
                await bot.sendMessage(chat_id, `Не работал ${date}` );
                // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});
                await notWork(msg, await getTaskForToday(chat_id, date))
                break;

            // Последний день больничного (спрашиваем у пользователя как дела)
            case "AllRight":
                const endNotWork = freeDays.findOne({where:{id: fid}});
                const userStatus = await users.findOne({where:{chat_id: id}})
                userStatus.update({status: true});
                await bot.sendMessage(id, "Все хорошо");
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


                // Получаем время в виде 06:30 (получаем время работы)
                const result = `${time.getHours() > 10 ? time.getHours() : "0" + time.getHours() }:${ time.getMinutes() > 10 ? time.getMinutes() : "0" + time.getMinutes() }`;

                await task.update({"hours": result})

                await bot.sendMessage(chat_id, "Полный день");

                break;


            // API
            case "C":
                const freeUser = await users.findOne({where:{ chat_id: id}})
                const lead = await users.findOne({ where: {team: freeUser.team, role: 2}})

                // d - debt

                const free = await freeDays.findOne({where:{id: fid}})

                const taskToday = await tasks.findOne({where:{id: tid}});
                if (taskToday !== null){
                    const currentDate = new Date(free.from);
                    currentDate.setHours(0,0,0,0);

                    const taskDate = new Date(taskToday.date)
                    taskDate.setHours(0,0,0,0);
                    console.log("selected");
                    console.log(currentDate.toString() == taskDate.toString());
                    console.log(`${currentDate} == ${taskDate}`);

                    // если взятый день сегодняшний то работа заканчивается
                    // пользователь сможет заполнить факт как только взятые дни закончатся
                    // предполагается что пользователь введет факт а затем возьмет день

                    if(taskDate.toString() === currentDate.toString()){
                        if (taskToday?.plan === null){
                            await taskToday.destroy();
                            console.log("deleted T")
                        }
                        freeUser.update({status: false});
                        console.log("deleted U")
                    }
                }


                await free.update({status: true})

                let text = `Уведомление!\n${freeUser.fio.trim()}\nКоманда: ${freeUser.team.trim()}\nПричина: ${free.cause}\nДата: ${free.from} - ${free.to}\n${free.message}`

                // if (canWorkToday(free.from)){
                //     await bot.sendMessage(id, "Сегодня вы не работаете")
                //     await freeUser.update({status: false});
                // }


                // проверка на промежуток времени в задаче

                // if (new Date(from) <= new Date(task.date) && new Date(to) > new Date(task.date)) {
                //     await users.update({ status: false }, {
                //         where: {
                //             chat_id: chat_id
                //         }
                //     });
                // }

                await bot.sendMessage(chat_id, "Вы подтвердили запрос")
                await bot.sendMessage(id, "Запрос подтвержден");
                await bot.sendMessage(lead.chat_id, "СТО подтвердил запрос\n"+text)

                break;
            case "R":
                await bot.sendMessage(chat_id, "Вы отклонили запрос")
                await bot.sendMessage(id, "Запрос отклонен");
                break;
        }
    } catch (e){
        await bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
        await bot.sendMessage(chat_id, e.message);
    }
});


// CRON


async function startCron(){
    const allUsers = await users.findAll({where: {status: true}})
    allUsers.map(async (user)=>{

        const time = user.work_time.split('-');
        const start = time[0].split(':');
        const end = time[1].split(':');

        let startDay = new CronJob(`00 ${start[1]} ${start[0]} * * 1-5`, async ()=>{
            const exist = await getTaskForToday(user.chat_id, setUTC(new Date()))
            if (exist !== null && exist?.plan) {
                await bot.sendMessage(user.chat_id, "Ваш план \n"+exist?.plan);
                await debt(user.chat_id);
            } else {
                await startPlan(user.chat_id)
            }
            startDay.stop();
        })
        startDay.start();

        const split = user.work_time.split('-');
        // const from = split[0].split(':');
        const to = split[1].split(':');

        const endTime = new Date()
        endTime.setHours(to[0], to[1]);
        endTime.setMinutes(endTime.getMinutes() - 30)

        end[0] = endTime.getHours();
        end[1] = endTime.getMinutes();

        console.log(`${start} - plan | ${end} - fact`);


        let endDay = new CronJob(`00 ${end[1]} ${end[0]} * * 1-5`, async ()=>{

            const exist = await getTaskForToday(user.chat_id, setUTC(new Date()))
            if (exist === null || exist?.plan === null) {
                await bot.sendMessage(user.chat_id, "Сначала введите план");
            }
            else if (exist?.fact !== null ) {

                await bot.sendMessage(user.chat_id, "Ваш факт \n"+exist?.fact)

            } else {
                await startFact(user.chat_id)
            }

            endDay.stop();
        })
        endDay.start();
    })
}

const {Op} = require("sequelize");

async function setUserStatus(){
    const currentDate = new Date().setHours(0,0,0,0);

    const notWork = await freeDays.findAll({where: {
            "from": {[Op.lte]: currentDate},
            "to": {[Op.gte]: currentDate},
            "status": true,
        }
    })

    console.log(notWork.length);

    notWork.map( async (el)=>{
        console.log(`${el.from} ${el.to} ${currentDate}}`)

        const user = await users.findOne({where:{chat_id : el.chat_id}})
        const chat_id = user.chat_id;

        const from = new Date(el.from).setHours(0,0,0,0);
        const to = new Date(el.to).setHours(0,0,0,0);

        if(to === currentDate && from === currentDate){
            // выйти или попросить еще
            // cron на ближайший 00 00 00 - 1 раз
            user.update({status: true});

        } else if(to === currentDate){

            setTimeout(async ()=>{


                const {message_id} = await bot.sendMessage(chat_id, "Как дела? Готов выйти завтра на работу?");

                const notWorkKeyboard = {
                    reply_markup: {
                        disable_notification: true,
                        inline_keyboard: [
                            [
                                {text: "Все хорошо", callback_data: JSON.stringify({type: "AllRight", fid: el.id, id: chat_id}) },
                                {text:"Взять еще", web_app: {url: `${webAppUrl}/free.html?user=${chat_id}&mid=${message_id}&tid=${null}`}}
                            ]
                        ]
                    }
                }

                await bot.editMessageReplyMarkup(notWorkKeyboard.reply_markup, {chat_id, message_id})

                const timer = setTimeout(async ()=>{
                    // из-за того что не могу получить по id сообщение пришлось изворачиваться
                    try {
                        await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
                        await bot.sendMessage(chat_id, "Все хорошо");

                        user.update({status: true});
                    } catch (e) {
                        console.log("Клавиатура уже была изменена")
                    }
                }, 1000*60*60*6);

            }, 1000*60*60*18)
        }
        else {
            user.update({status: false});
        }

        // если наступил начальны день то статус в false и последующие дни тоже в false кроме последнего
        // можно

        // 00 -> создаю на часов 12 на весь день 12

    })
}


let changeStatus = new CronJob(`00 30 00 * * 1-5`, async ()=>{
    await setUserStatus();
    await startCron();
})
changeStatus.start();



