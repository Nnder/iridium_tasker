const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {tasks} = require("../../database/models");
const {Op} = require("sequelize");
const {plan} = require('./plan');
const {fact} = require('./fact');
const {notWork} = require("../notWork/notWork");

async function debt(msg, match){
    const chat_id = msg.chat.id;

    let start = new Date(0);

    let end = setUTC(new Date());
    end.setUTCHours(-24)
    // end.setUTCHours(23,59,59,999);

    const task = await tasks.findAll({ where: {
            "chat_id": chat_id,
            "fact": null,
            "date": {
                [Op.between]: [start, end]
            }
        }
    })

    // "date": {
    //     [Op.between]: [start, end]
    // }

    task.map(async (task, number) => {
        let messageWithKeyboard;

        const keyboardFact = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Ввести Факт", callback_data: JSON.stringify({type: "Enter Fact Past", chat_id: msg.chat.id, date: task.date}) },
                        ],
                    ],
                }
        };

        const keyboardPlanFact = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Ввести план", callback_data: JSON.stringify({type: "Enter Plan Past", chat_id: msg.chat.id, date: task.date}) },
                            { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work Past", chat_id: msg.chat.id, date: task.date}) },
                        ],
                    ],
                }
        };

        if (task?.plan !== null){
            let message = `У вас нету факта на ${task.date}`;
            messageWithKeyboard = await bot.sendMessage(chat_id, message+"\nВаш план\n"+task.plan, keyboardFact);
        } else {
            let message = `У вас нету плана/факта на ${task.date}`
            messageWithKeyboard = await bot.sendMessage(chat_id, message, keyboardPlanFact);
        }


        setTimeout(()=>{
            const {message_id} = messageWithKeyboard;
            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
        }, 1000*60*60*8);
    })






    // await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})


    // bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    //     const {type} = JSON.parse(callbackQuery.data);
    //     const chat_id = callbackQuery.message.chat.id;
    //     const message_id = callbackQuery.message.message_id;th
    //
    //     const {date} = JSON.parse(callbackQuery.data);
    //
    //
    //     await bot.answerCallbackQuery(callbackQuery.id)
    //     // clearTimeout(timer)
    //
    //     try {
    //         switch (type) {
    //             case "Enter Plan Past":
    //
    //
    //
    //                 await bot.editMessageReplyMarkup({inline_keyboard: [[
    //                         { text: "Ввести Факт", callback_data: JSON.stringify({type: "Enter Fact", chat_id: msg.chat.id, date: date}) },
    //                     ]]}, {chat_id, message_id})
    //
    //                 bot.sendMessage(chat_id, `Введите план за ${date}`);
    //
    //                 console.log(new Date(date));
    //
    //                 bot.onText(/\.*/gmi , (msg)=>{
    //                     plan(msg, match, new Date(date))
    //                     bot.sendMessage(chat_id, msg.text);
    //                     bot.removeTextListener(/\.*/gmi);
    //                 })
    //
    //                 break;
    //             case "Enter Fact Past":
    //
    //
    //
    //                 await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});
    //
    //                 bot.sendMessage(chat_id, `Введите факт за ${date}`)
    //                 bot.onText(/\.*/gmi, (msg) => {
    //                     fact(msg, match, date)
    //                     bot.removeTextListener(/\.*/gmi);
    //                 })
    //
    //                 break;
    //             case "Not Work Past":
    //                 bot.sendMessage(chat_id, `Не работал ${date}` );
    //                 await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id});
    //                 notWork(msg, await getTaskForToday(chat_id, date))
    //                 break;
    //         }
    //     } catch (e){
    //         bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
    //     }
    //
    //
    // });









    // получить все задачи у которых был не введен план или факт
    // в случае если был не введен факт выводить пользователю его план и просить дописать факт
    // в случае если даже план не заполнен то попросит заполнить о и то
}

module.exports = {
    debt
}