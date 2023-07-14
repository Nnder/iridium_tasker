const {users} = require("../../database/models");

async function canSend(chat_id){
    let user = await users.findOne({where:{chat_id}})
    return !!(user !== null && user?.status);
}

module.exports = {
    canSend
}
