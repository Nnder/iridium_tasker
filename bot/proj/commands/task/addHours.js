const {bot} = require("../../index");

function addHours(msg, task){
    const chat_id = msg.chat.id;

    let fullDay = {
        reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Полный день", callback_data: JSON.stringify({type: "Full day", chat_id: chat_id}) },
                        { text: 'Не полный день', callback_data: JSON.stringify({type: "Not full day", chat_id: chat_id}) },
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

                        // let tasker = getTaskForToday(chat_id)
                        //
                        task.update({
                            "hours": 10
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
