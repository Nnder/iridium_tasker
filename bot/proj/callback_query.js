const {plan} = require("./commands/task/plan");
const {debt} = require("./commands/task/debt");
const {notWork} = require("./commands/notWork/notWork");
const {getTaskForToday} = require("./commands/task/getTask");
const {fact} = require("./commands/task/fact");
const {users, freeDays} = require("./database/models");
const {bot} = require("./index");
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

    const {type, date, data} = JSON.parse(callbackQuery.data);
    const chat_id = callbackQuery.message.chat.id;
    const message_id = callbackQuery.message.message_id;

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
            case "Confirm":
                const lead = await users.findOne({ where: {team: data.team, role: 2}})
                const free = await freeDays.findOne({where:{id: data.free}})

                free.update({
                    status: true
                })

                // проверка на промежуток времени в задаче

                // if (new Date(from) <= new Date(task.date) && new Date(to) > new Date(task.date)) {
                //     await users.update({ status: false }, {
                //         where: {
                //             chat_id: chat_id
                //         }
                //     });
                // }




                bot.sendMessage(chat_id, "Вы подтвердили запрос")
                bot.sendMessage(data.user_id, "Запрос подтвержден");
                bot.sendMessage(lead.chat_id, "СТО подтвердил запрос\n"+text)

                break;
            case "Refuse":
                bot.sendMessage(chat_id, "Вы отклонили запрос")
                bot.sendMessage(data.user_id, "Запрос отклонен");
                break;
        }
    } catch (e){
        bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
    }
});



