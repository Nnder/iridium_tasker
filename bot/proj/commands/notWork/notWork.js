// позволяет взять больнычный, отпуск, неоплычиваемый отпуск, поход к доктору
// принимает дату(от, до), тип (больничный, отпуск..), сообщение и состояние(принято/отклонено)
// на нем формирует сообщение
// отпровляет всем админам(role) сформированное сообщение с 2 кнопками (принять/отклонить)


const {bot,webAppUrl} = require("../../index");
const {setUTC} = require("../task/getTask");
const {freeDays, users, tasks} = require("../../database/models");
const {where, Op} = require("sequelize");

async function notWork(msg, task){
    const chat_id = msg.chat.id;


    await task.destroy();

    const webAppKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{text:"Форма", web_app: {url: `${webAppUrl}/free.html?user=${chat_id}`}}]
            ]
        }
    }

    const messageWithKeyboard = await bot.sendMessage(chat_id, "Заполните форму", webAppKeyboard);


    const timer = setTimeout(()=>{
        const {message_id} = messageWithKeyboard;
        bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
        bot.sendMessage(chat_id, "Вы не заполнели форму");
    }, 1000*60*60*10);
}

module.exports = {
    notWork
}