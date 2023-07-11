const {users} = require("../database/models");
const sequelize = require("../database/db");
const { Op} = require('sequelize');
const {bot} = require('../index');
const {info} = require('./user/info');
const {getTaskForToday, setUTC} = require("./task/getTask");
const {startPlan} = require("./task/plan");

async function start(msg, match){
    const chatId = msg.chat.id;

    const reqPhone = {
        reply_markup: {
            remove_keyboard: true,
            keyboard: [
                [{
                    text: "Отправить мой номер",
                    request_contact: true,
                }],
                ["Отмена"]
            ]
        }
    }

    const remove = {reply_markup: { remove_keyboard: true },}

    const isIdUnique = chat_id =>
        users.findOne({ where: { chat_id }, attributes: ['chat_id'] })
            .then(token => token)


    if (await isIdUnique(chatId)) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы', remove)
    } else {
        bot.sendMessage(chatId, 'Вас нет в списке, отправьте номер ', reqPhone)

        await bot.once('contact', async (msg) => {
            if (chatId === msg.chat.id){
                const telUser = msg.contact.phone_number.replace('+', '')
                const exist = await getTaskForToday(msg.chat.id, setUTC(new Date()))

                const isIdUnique = phone =>
                    users.findOne({ where: { phone }, attributes: ['phone'] })
                        .then(token => token !== null)
                        .then(isUnique => isUnique);

                isIdUnique(telUser).then(isUnique => {
                    if (isUnique) {
                        bot.sendMessage(chatId, 'Вы можете начать работать с ботом', remove)
                        sequelize.query("UPDATE users SET chat_id = $2 WHERE phone = $1", {
                            bind: [telUser, chatId],
                            model: users,
                            mapToModel: true,
                            type: Op.SELECT,
                        })

                        info(msg, match).then(()=>{
                            if (exist !== null && exist?.plan) {

                                bot.sendMessage(msg.chat.id, "Ваш план \n"+exist?.plan);
                                // debt(msg, match);

                            } else {
                                startPlan(msg.chat.id)
                            }
                        })



                    } else {
                        bot.sendMessage(chatId, 'Вас нет в списке, обратитесь к администратору', remove);
                    }
                })
            }

        })
    }
}

module.exports = {
    start
};