const {tasks} = require("../../database/models");
const {Op} = require("sequelize");

async function getTaskForToday(chat_id){
    let start = new Date();
    start.setUTCHours(0,0,0,0);

    let end = new Date();
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
    getTaskForToday
}