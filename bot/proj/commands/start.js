// запускается 1 раз больше не работает
// вызывает команды
// setFIO (не нужна)
// график работы (не нужна)
// setPhone (нужна)
// changeTeam (нужна)
// profession (не нужна)

// checkPhone (нужна)
// info (нужна)
// changeTeam (нужна)

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
        bot.sendMessage(chatId, 'Вы уже зарегестрированы', remove)
    } else {
        bot.sendMessage(chatId, 'Вас нет в списке, отправьте номер ', reqPhone)

        bot.once('contact', async (msg) => {
            const telUser = msg.contact.phone_number.replace('+', '')
            const exist = await getTaskForToday(user.chat_id, setUTC(new Date()))

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

                    info(msg, match);
                    if (exist !== null && exist?.plan) {

                        bot.sendMessage(user.chat_id, "Ваш план \n"+exist?.plan);
                        // debt(msg, match);

                    } else {
                        startPlan(user.chat_id)
                    }


                } else {
                    bot.sendMessage(chatId, 'Вас нет в списке, обратьтесь к администратору', remove);
                }
            })
        })
    }
}

module.exports = {
    start
};