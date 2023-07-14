// позволяет взять больничный, отпуск, неоплачиваемый отпуск, поход к доктору
// принимает дату(от, до), тип (больничный, отпуск..), сообщение и состояние(принято/отклонено)
// на нем формирует сообщение
// отправляет всем админам(role) сформированное сообщение с 2 кнопками (принять/отклонить)


const {bot,webAppUrl} = require("../../index");
const {setUTC} = require("../task/getTask");
const {freeDays, users, tasks} = require("../../database/models");
const {where, Op} = require("sequelize");

async function notWork(msg, task){
    const chat_id = msg.chat.id;

    const {message_id} = await bot.sendMessage(chat_id, "Заполните форму");
    const webAppKeyboard = {
        reply_markup: {
            disable_notification: true,
            inline_keyboard: [
                [{text:"Форма", web_app: {url: `${webAppUrl}/free.html?user=${chat_id}&mid=${message_id}&tid=${task.id}`}}]
            ]
        }
    }

    await bot.editMessageReplyMarkup(webAppKeyboard.reply_markup, {chat_id, message_id})


    const timer = setTimeout(()=>{
        try {
            bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
            bot.sendMessage(chat_id, "Вы не заполняли форму");
        } catch (e) {
            console.log("Клавиатура уже была изменена")
        }
    }, 1000*60*60*2);
}



async function canWorkToday(from){
    const today = new Date();
    today.setHours(0,0,0,0,);

    const date = new Date(from)
    date.setHours(0,0,0,0);

    if (today.toString() === date.toString()){
        console.log(`Они равны ${today.toString()} ${date.toString()}`)
    } else {
        console.log(`Они не равны ${today.toString()} ${date.toString()}`)
    }

    return today.toString() === date.toString()
}

module.exports = {
    canWorkToday,
    notWork
}