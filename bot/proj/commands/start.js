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

    const isIdUnique = chat_id =>
        users.findOne({ where: { chat_id }, attributes: ['chat_id'] })
            .then(token => token)


    if (await isIdUnique(chatId)) {
        bot.sendMessage(chatId, 'Вы уже зарегестрированы')
    } else {
        bot.sendMessage(chatId, 'Вас нет в списке, отправьте номер ', reqPhone)

        bot.once('contact', msg => {
            const telUser = msg.contact.phone_number.replace('+', '')
            console.log(msg);


            const isIdUnique = phone =>
                users.findOne({ where: { phone }, attributes: ['phone'] })
                    .then(token => token !== null)
                    .then(isUnique => isUnique);

            isIdUnique(telUser).then(isUnique => {
                if (isUnique) {
                    bot.sendMessage(chatId, 'Вы можете начать работать с ботом')
                    sequelize.query("UPDATE users SET chat_id = $2 WHERE phone = $1", {
                        bind: [telUser, chatId],
                        model: users,
                        mapToModel: true,
                        type: Op.SELECT,
                    })

                    info(msg, match);

                } else {
                    bot.sendMessage(chatId, 'Вас нет в списке, обратьтесь к администратору');
                }
            })
        })
    }
}

module.exports = {
    start
};