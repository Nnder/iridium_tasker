// команда для изменение статуса команды


const {users, tasks} = require("../../database/models");
const {bot} = require('../../index');

async function changeStatus(msg, match){
    const chat_id = msg.chat.id;
    const data = await users.findOne({ where: { chat_id: chat_id } })
    const {phone, team} = data.dataValues;

    bot.sendMessage(chat_id, "Введите новую задачу", {reply_markup: JSON.stringify({ force_reply: true })}).then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id,(msg)=>{
            const task = tasks.create({
                "phone": phone,
                "team": team,
                "text": msg.text,
                "date_start": +Date.now(),
            });
            bot.removeReplyListener(replyId);
        })
    })
}

module.exports = {
    changeStatus
}