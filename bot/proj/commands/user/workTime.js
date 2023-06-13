// график работы user с - по

const {users} = require('../../database/models');
const sequelize = require("../../database/db");
const { Op, QueryTypes} = require('sequelize');
const {bot} = require('../../index');

async function workTime(msg, match) {
    const chat_id = msg.chat.id;
    const data = await users.findOne({ where: { chat_id: chat_id } });
    let {work_time} = data.dataValues;

    let workTimeInfo = `Ваше рабочее время: ${work_time} Если хотите поменять время работы, введите его ниже:`;

    bot.sendMessage(chat_id, workTimeInfo, {reply_markup: JSON.stringify({force_reply: true})}). then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id, (msg)=>{
            sequelize.query(`UPDATE users SET work_time = $2 WHERE chat_id = $1`, {
                bind:[msg.chat.id, msg.text],
                model: users,
                mapToModel: true,
                type: Op.SELECT,
            });

            bot.sendMessage(chat_id, `Вы успешно изменили время работы на ${msg.text}`)
            bot.removeReplyListener(replyId);
        });

    });
}

module.exports = {
    workTime
}