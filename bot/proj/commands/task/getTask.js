const {tasks} = require("../../database/models");
const {Op} = require("sequelize");

function setUTC(date){
    // устанавливает utc Екатеринбурга
    let hour = date.getTimezoneOffset() > 0 ? date.getTimezoneOffset()/60 : date.getTimezoneOffset()/60*-1;
    date.setHours(date.getHours() + hour);
    return date
}


async function getTaskForToday(chat_id, date){
    const options = { timeZone: 'Asia/Yekaterinburg'};
    const formattedDate = date.toLocaleString('en-US', options);
    const parsed = Date.parse(formattedDate)

    let start = setUTC(new Date());
    start.setUTCHours(0,0,0,0);

    let end = setUTC(new Date());
    end.setUTCHours(23,59,59,999);

    const task = await tasks.findOne({ where: {
            "chat_id": chat_id ,
            "date": {
                [Op.between]: [start, end]
            }
        }
    })

    return task
}

module.exports = {
    getTaskForToday,
    setUTC
}