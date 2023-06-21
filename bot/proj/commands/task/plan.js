const {tasks, users} = require("../../database/models");
const {bot} = require("../../index");
const {Op} = require("sequelize");
const {getTaskForToday} = require("./getTask");


async function plan(msg, match) {

    const chat_id = msg.chat.id;
    let task = await getTaskForToday(chat_id);

    if (task !== null) {

        task.update({
            "plan": msg.text
        })

        bot.sendMessage(chat_id, "План успешно записан");

    } else {
        bot.sendMessage(chat_id, "План не записан");
    }



    // const task = tasks.create({
    //     "chat_id": chat_id,
    //     "plan": msg.text,
    //     "date": Date.now(),
    // });



}

module.exports = {
    plan
}
