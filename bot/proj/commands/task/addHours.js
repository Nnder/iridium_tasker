const {bot, webAppUrl} = require("../../index");
async function addHours(msg, task){
    const chat_id = msg.chat.id;

    let fullDay = {
        reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Полный день", callback_data: JSON.stringify({type: "Full day", id: chat_id, tid: task.id}) },
                        { text: "Не полный день", web_app: {url: `${webAppUrl}/time.html?user=${chat_id}&task=${task.id}`}}
                    ],
                ]
            }
    };

    let messageWithKeyboard = await bot.sendMessage(chat_id, "У тебя был полный день?", fullDay)

    const timer = setTimeout(async ()=>{
        // из-за того что не могу получить по id сообщение пришлось изворачиваться
        try {
            const {message_id} = messageWithKeyboard;
            await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            await bot.sendMessage(chat_id, "Рабочее время введено по стандарту");
        } catch (e) {
            console.log("Клавиатура уже была изменена")
        }

    }, 1000*60*60*2);
}


module.exports = {
    addHours
}
