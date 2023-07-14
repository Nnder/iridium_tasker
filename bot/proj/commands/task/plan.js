const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {tasks, users} = require("../../database/models");


async function plan(msg, match = "", date = setUTC(new Date())) {

    console.log(date);
    const chat_id = msg.chat.id;
    let task = await getTaskForToday(chat_id, date);
    console.log(task);

    if (task !== null) {
        await task.update({"plan": msg.text})
        await bot.sendMessage(chat_id, "План успешно записан");
    } else {
        await bot.sendMessage(chat_id, "План не записан");
    }
}


async function startPlan(chat_id){

    let options = {
        reply_markup:
            {
                disable_notification: true,
                inline_keyboard: [
                    [
                        { text: "Ввести план на день", callback_data: JSON.stringify({type: "Enter Plan", chat_id: chat_id}) },
                        { text: 'Не работаю', callback_data: JSON.stringify({type: "Not Work", chat_id: chat_id}) },
                    ],
                ],
            }
    };




    let messageWithKeyboard = await bot.sendMessage(chat_id, "Доброе утро! Что на сегодня запланировал?", options)

    const currentDate = setUTC(new Date());

    if (await getTaskForToday(chat_id, currentDate) === null) {
        let task = await tasks.create({
            "chat_id": chat_id,
            "date": currentDate,
        })
    }

    console.log(await timestampWork(chat_id))

    const timer = setTimeout(async ()=>{
        // из-за того что не могу получить по id сообщение пришлось изворачиваться
        try {
            const {message_id} = messageWithKeyboard;
            await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            await bot.sendMessage(chat_id, "Вы не заполнили план");
        } catch (e) {
            console.log("Клавиатура уже была изменена")
        }

    }, await timestampWork(chat_id));
}


async function timestampWork(chat_id, minus = 0){
    const user = await users.findOne({where:{chat_id: chat_id}})

    const split = user.work_time.split('-');
    const from = split[0].split(':');
    const to = split[1].split(':');

    const time = new Date()
    time.setHours(to[0] - from[0], to[1] - from[1])

    return ((1000*60*60) * time.getHours()) + ((1000*60) * time.getMinutes()) - minus;
}


module.exports = {
    plan,
    startPlan
}
