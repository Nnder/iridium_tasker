const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {tasks} = require("../../database/models");


async function plan(msg, match, date = setUTC(new Date())) {

    console.log(date);
    const chat_id = msg.chat.id;
    let task = await getTaskForToday(chat_id, date);
    console.log(task);

    if (task !== null) {

        task.update({
            "plan": msg.text
        })

        bot.sendMessage(chat_id, "План успешно записан");



    } else {
        bot.sendMessage(chat_id, "План не записан");
    }

}


async function startPlan(msg){
    const chat_id = msg.chat.id;

    let options = {
        reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Ввести план на день", callback_data: JSON.stringify({type: "Enter Plan", chat_id: msg.chat.id}) },
                        { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work", chat_id: msg.chat.id}) },
                    ],
                ],
            }
    };

    let messageWithKeyboard = await bot.sendMessage(msg.chat.id, "Доброе утро! Что на сегодня запланировал?", options)

    const currentDate = setUTC(new Date());

    if (await getTaskForToday(chat_id, currentDate) === null) {
        task = await tasks.create({
            "chat_id": chat_id,
            "date": currentDate,
        })
    }


    const timer = setTimeout(()=>{
        const {message_id} = messageWithKeyboard;
        bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
        bot.sendMessage(chat_id, "Вы не заполнили план");
    }, 1000*60*60*8);
}

module.exports = {
    plan,
    startPlan
}
