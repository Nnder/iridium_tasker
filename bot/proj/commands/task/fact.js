const {tasks} = require("../../database/models");
const {bot} = require("../../index");
const { Op } = require("sequelize");
const {getTaskForToday} = require("./getTask");


async function fact(msg, match){
    const chat_id = msg.chat.id;
    const task = await getTaskForToday(chat_id);

    if (task !== null && task?.plan !== null) {

        task.update({
            "fact": msg.text
        })

        bot.sendMessage(chat_id, "факт успешно записан");
    } else {
        bot.sendMessage(chat_id, "Факт не записан");
    }


    // bot.sendMessage(chat_id, "Введите факт", {reply_markup: JSON.stringify({ force_reply: true })}).then(msg =>{
    //     let replyId = bot.onReplyToMessage(chat_id, msg.message_id,(msg)=>{
    //
    //
    //         bot.removeReplyListener(replyId);
    //     })
    // })
}

module.exports = {
    fact
}
