// вывести все задачи за неделю (законченные и не законченные)
// у незаконченных будет кнопка выполнить
const {users, tasks} = require("../../database/models");
const {bot} = require("../../index");

async function taskList(msg, match) {

    const chat_id = msg.chat.id;
    const user = await users.findOne({ where: { "chat_id": chat_id } })
    const {phone, team} = user.dataValues;
    const list = await tasks.findAll({ where: { "phone": phone, "team": team } })

    for (let i = 0; i < list.length; i++) {

        const {id, status, team, text, date_start, date_end} = list[i];
        let complete = status ? "✅" : "❌";

        let options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        { text: complete, callback_data: JSON.stringify({type: "status", task_id: id}) },
                        { text: '✏', callback_data: JSON.stringify({type: "edit", task_id: id}) },
                        { text: '🗑', callback_data: JSON.stringify({type: "delete", task_id: id}) }
                    ],
                ]
            })
        };

        let data =`№${i+1}\n${text} \n`;
        await bot.sendMessage(chat_id, data, options);
    }
}

bot.on('callback_query', function onCallbackQuery(callbackQuery) {

    const {type, task_id} = JSON.parse(callbackQuery.data);
    const msg = callbackQuery.message;
    // console.log(callbackQuery)


    switch (type) {
        case "status": console.log(task_id)
            break;
        case "edit":
            break;
        case "delete":
            break;

    }
});

module.exports = {
    taskList
}