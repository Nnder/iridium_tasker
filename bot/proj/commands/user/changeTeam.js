// вывести 10 команд (Созданные на автомате)
// позволить пользователю ввести свой номер команды (создание своей команды)
// пользователи будут делится на команды (если у них одна и та же команда)

const { combineTableNames } = require('sequelize/types/utils');
const {users} = require('../../database/models');
const sequelize = require("../database/db");
const { Op, QueryTypes} = require('sequelize');
const {bot} = require('../../index');

async function changeTeam(msg, match) {
    const chat_id = msg.chat.id;
    const data = await users.findOne({ where: { chat_id: chat_id } });
    let {phone, fio, team, profession, work_time} = data.dataValues;

    let teamInfo = `
Текущая команда: ${team}
Введите новую команду, в которую вы хотите перейти:
    `;

    bot.sendMessage(chat_id, teamInfo, {reply_markup: JSON.stringify({force_reply: true})}). then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id, (msg)=>{msg.text});
        sequelize.query(`UPDATE users SET team = ${msg.text} WHERE chat_id = ${chat_id}`, {
            bind:[msg.chat.id,msg.text],
            model: users,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.removeReplyListener(replyId);
    });

}

module.exports = {
    changeTeam
}