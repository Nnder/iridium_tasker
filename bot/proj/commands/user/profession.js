// проффесия пользователя (можно ввести что угодно, нужно для отчета)

const {users} = require('../../database/models');
const sequelize = require("../../database/db");
const { Op} = require('sequelize');
const {bot} = require('../../index');

async function profession(msg, match) {
    const chat_id = msg.chat.id;
    const data = await users.findOne({ where: { chat_id: chat_id } });
    let {profession} = data.dataValues;

    let profInfo = `Ваша профессия: ${profession} Если это не ваша профессия, введите другую:`;

    bot.sendMessage(chat_id, profInfo, {reply_markup: JSON.stringify({force_reply: true})}). then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id, (msg)=>{
            sequelize.query(`UPDATE users SET profession = $2 WHERE chat_id = $1`, {
                bind:[msg.chat.id, msg.text],
                model: users,
                mapToModel: true,
                type: Op.SELECT,
            });

            bot.sendMessage(chat_id, `Вы успешно изменили профессию на ${msg.text}`)
            bot.removeReplyListener(replyId);
        });

    });
}

module.exports = {
    profession
}