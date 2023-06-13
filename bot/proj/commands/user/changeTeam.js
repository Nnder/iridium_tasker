// вывести 10 команд (Созданные на автомате)
// позволить пользователю ввести свой номер команды (создание своей команды)
// пользователи будут делится на команды (если у них одна и та же команда)

const {users} = require('../../database/models');
const sequelize = require("../../database/db");
const { Op, QueryTypes} = require('sequelize');
const {bot} = require('../../index');

async function changeTeam(msg, match) {
    const chat_id = msg.chat.id;
    const data = await users.findOne({ where: { chat_id: chat_id } });
    let {team} = data.dataValues;

    let teamInfo = `Текущая команда: ${team} Введите новую команду, в которую вы хотите перейти:`;

    bot.sendMessage(chat_id, teamInfo, {reply_markup: JSON.stringify({force_reply: true})}). then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id, (msg)=>{
            sequelize.query(`UPDATE users SET team = $2 WHERE chat_id = $1`, {
                bind:[msg.chat.id, msg.text],
                model: users,
                mapToModel: true,
                type: Op.SELECT,
            });

            bot.sendMessage(chat_id, `Вы успешно сменили команду на ${msg.text}`)
            bot.removeReplyListener(replyId);
        });

    });
}

module.exports = {
    changeTeam
}