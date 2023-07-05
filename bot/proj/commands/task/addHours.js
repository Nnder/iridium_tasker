const {bot, webAppUrl} = require("../../index");
const worker_threads = require("worker_threads");
const {users} = require("../../database/models");

function addHours(msg, task){
    const chat_id = msg.chat.id;

    let fullDay = {
        reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Полный день", callback_data: JSON.stringify({type: "Full day", chat_id: chat_id}) },
                        { text: "Не полный день", web_app: {url: `${webAppUrl}/time.html?user=${chat_id}&task=${task.id}`}}
                    ],
                ]
            }
    };

    bot.sendMessage(chat_id, "У тебя был полный день?", fullDay)

    let countClick = 0;

    bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

        const {type, task_id} = JSON.parse(callbackQuery.data);
        const message_id = callbackQuery.message.message_id;

        await bot.answerCallbackQuery(callbackQuery.id)

        ++countClick
        if (countClick === 1) {

            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

            try {
                switch (type) {
                    case "Full day":

                        // write a function

                        const user = await users.findOne({where:{chat_id: chat_id}})



                        const split = user.work_time.split('-');

                        const from = split[0].split(':');
                        const to = split[1].split(':');

                        console.log(from + "|" + to);

                        const time = new Date()
                        time.setHours(to[0] - from[0], to[1] - from[1])

                        const result = `${time.getHours() > 10 ? time.getHours() : "0" + time.getHours() }:${ time.getMinutes() > 10 ? time.getMinutes() : "0" + time.getMinutes() }`;

                        console.log(result);


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
                }
            } catch (e) {
                bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
                bot.sendMessage(chat_id, e.message);
            }
        }
    });
}


module.exports = {
    addHours
}
