const {users} = require("../../database/models");


async function canSend(chat_id){
    let user = await users.findOne({where:{chat_id}})

    if (user !== null && user?.status){
        return true
    } else {
        return false
    }
}

module.exports = {
    canSend
}
