// вывести все задачи за неделю (законченные и не законченные)

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
    const chat_id = callbackQuery.message.chat.id;
    // console.log(callbackQuery)

    try {
        switch (type) {
            case "status": changeTaskStatus(chat_id, task_id);
                break;
            case "edit": editTask(chat_id, task_id);
                break;
            case "delete": deleteTask(chat_id, task_id);
                break;

        }
    } catch (e){
        bot.sendMessage(callbackQuery.message.chat.id, "Ошибка! Что-то пошло не так");
    }
});

async function changeTaskStatus(chat_id, task_id){
    const task = await tasks.findOne({ where: { "id": task_id} });
    await task.update({
        "status" : !task.status
    });
    await bot.sendMessage(chat_id, "Статус задачи изменен");
}

async function editTask(chat_id, task_id){

    const task = await tasks.findOne({ where: { "id": task_id} });
    bot.sendMessage(chat_id, task.text, {reply_markup: JSON.stringify({force_reply: true})}). then(msg =>{
        let replyId = bot.onReplyToMessage(chat_id, msg.message_id, (msg)=>{
            task.update(
                {
                    "text": msg.text
                }
            );

            bot.sendMessage(chat_id, `Вы успешно изменили задачу`);
            bot.removeReplyListener(replyId);
        });
    })
}

async function deleteTask(chat_id, task_id){
    const task = await tasks.findOne({ where: { "id": task_id} });
    await task.destroy();
    await bot.sendMessage(chat_id, "Задача была удалена");
}

module.exports = {
    taskList
}