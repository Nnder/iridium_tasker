const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {addHours} = require("./addHours");

async function fact(msg, match, date = setUTC(new Date())){
    const chat_id = msg.chat.id;
    const task = await getTaskForToday(chat_id, date);

    if (task !== null && task?.plan !== null) {

        await task.update({
            "fact": msg.text
        })

        bot.sendMessage(chat_id, "факт успешно записан");

        addHours(msg, await getTaskForToday(chat_id, date))
    } else {
        bot.sendMessage(chat_id, "Факт не записан");
    }

}

async function startFact(chat_id) {

    let options = {
        reply_markup: JSON.stringify({

            inline_keyboard: [
                [
                    { text: "Ввести факт", callback_data: JSON.stringify({type: "Enter fact", chat_id: chat_id}) },
                ],
            ],
            one_time_keyboard: true
        })
    };


    let messageWithKeyboard = await bot.sendMessage(chat_id, "Что сделал за сегодня?", options);

    const timer = setTimeout(async ()=>{
        // из-за того что не могу получить по id сообщение пришлось изворачиватся
        try {
            const {message_id} = messageWithKeyboard;
            await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            await bot.sendMessage(chat_id, "Вы не заполнили факт");
        } catch (e) {
            console.log("Клавиатура уже была изменена")
        }
    }, 1000*60*60);
}

module.exports = {
    fact,
    startFact
}
