const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");
const {addHours} = require("./addHours");




async function fact(msg, match){
    const chat_id = msg.chat.id;
    const task = await getTaskForToday(chat_id, setUTC(new Date()));

    if (task !== null && task?.plan !== null) {

        task.update({
            "fact": msg.text
        })

        bot.sendMessage(chat_id, "факт успешно записан");

        addHours(msg, await getTaskForToday(chat_id, setUTC(new Date())))
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
