// вывести все задачи за неделю (законченные и не законченные)
// у незаконченных будет кнопка выполнить
const {users, tasks} = require("../../database/models");
const {bot} = require("../../index");

async function taskList(msg, match) {

    const chat_id = msg.chat.id;
    const user = await users.findOne({ where: { "chat_id": chat_id } })
    const {phone, team} = user.dataValues;
    const list = await tasks.findAll({ where: { "phone": phone, "team": team } })

    let data = "";

    // list.forEach((el)=>{
    //     data+= JSON.stringify(el);
    // })

    for (let i = 0; i < list.length; i++) {
        const {status, team, text, date_start, date_end} = list[i];
        data+=`№${i} ${text}\n`;
    }

    bot.sendMessage(chat_id, data);


    // bot.sendMessage(chat_id, "Введите новую задачу", {reply_markup: JSON.stringify({ force_reply: true })}).then(msg =>{
    //     let replyId = bot.onReplyToMessage(chat_id, msg.message_id,(msg)=>{
    //         const task = tasks.create({
    //             "phone": phone,
    //             "team": team,
    //             "text": msg.text,
    //             "date_start": +Date.now(),
    //         });
    //         bot.removeReplyListener(replyId);
    //     })
    // })
}

module.exports = {
    taskList
}