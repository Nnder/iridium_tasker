const {bot} = require("../../index");
const {getTaskForToday, setUTC} = require("./getTask");


async function plan(msg, match, date = setUTC(new Date())) {

    console.log(date);
    const chat_id = msg.chat.id;
    let task = await getTaskForToday(chat_id, date);
    console.log(task);

    if (task !== null) {

        task.update({
            "plan": msg.text
        })

        bot.sendMessage(chat_id, "План успешно записан");



    } else {
        bot.sendMessage(chat_id, "План не записан");
    }

}

module.exports = {
    plan
}
