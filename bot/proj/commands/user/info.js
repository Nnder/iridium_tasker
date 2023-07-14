// вывести всю информацию о пользователе
// имя, задач за неделю, команды, кто он(стажер, программист, ыдизайнер...)

const {users} = require('../../database/models');
const {bot} = require('../../index');

async function info(msg, match) {
    const chat_id = msg.chat.id;

    const user = await users.findOne({ where: { chat_id: chat_id } })

    let userInfo = `
Текущая информация о вас
Тел: ${user.phone}
ФИО: ${user.fio}
Текущая команда: ${user.team}
Профессия: ${user.profession}
Рабочее время: ${user.work_time}

Учитывая выбранный график работы, бот пришлёт уведомление о вводе плана и факта. 
Пожалуйста, установите корректный график работы.`;

    await bot.sendMessage(chat_id, userInfo);
}

module.exports = {
    info
}