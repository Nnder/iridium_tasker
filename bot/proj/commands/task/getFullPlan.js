const {setUTC} = require("./getTask");
const {tasks} = require("../../database/models");
const {Op} = require("sequelize");
const {bot} = require("../../index");


// правильный вывод даты

async function getFullPlan(msg ,start = setUTC(new Date(0)), end = setUTC(new Date)){
    const chat_id = msg.chat.id;
    start.setUTCHours(0,0,0,0);

    const task = await tasks.findAll({ where: {
            "chat_id": chat_id,
            "date": {
                [Op.between]: [start, end]
            }
        }
    })

    let slash ='-'.repeat(95);
    let text = `Ваши планы/факты с ${start} по ${end}\n${slash}\n`;

    if (task.length === 0){
        bot.sendMessage(chat_id, "У вас нету задач");
    }

    task.map(async (task)=>{
        if (task?.fact !== null && task?.plan !== null) {
            text+=`${task.date}\n\nПлан\n${task.plan}\n\nФакт\n${task.fact}\n${slash}\n`;
        } else if (task?.fact !== null){
            text+=`${task.date}\n\nПлан\n${task.plan}\n${slash}\n`;
        } else {
            text+=`${task.date}\nНе заполнено план и факт\n${slash}\n`;
        }
    })

    await bot.sendMessage(chat_id, text);
}




module.exports = {
    getFullPlan
}
