const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {tasks} = require("../../database/models");
const {Op} = require("sequelize");
const {plan} = require('./plan');
const {fact} = require('./fact');
const {notWork} = require("../notWork/notWork");

async function debt(chat_id, match = ""){

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
                            { text: "Ввести Факт", callback_data: JSON.stringify({type: "EFD", id: chat_id, date: task.date}) },
                        ],
                    ],
                }
        };

        const keyboardPlanFact = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Ввести план", callback_data: JSON.stringify({type: "EPD", id: chat_id, date: task.date}) },
                            { text: 'Не работаю', callback_data: JSON.stringify({type: "NWD", id: chat_id, date: task.date}) },
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


        let time = setTimeout(async ()=>{
            // из-за того что не могу получить по id сообщение пришлось изворачиваться
            try {
                const {message_id} = messageWithKeyboard;
                await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            } catch (e) {
                console.log("Клавиатура уже была изменена")
            }
        }, 1000*60*60*8);
    })

    // получить все задачи у которых был не введен план или факт
    // в случае если был не введен факт выводить пользователю его план и просить дописать факт
    // в случае если даже план не заполнен то попросит заполнить о и то
}

module.exports = {
    debt
}