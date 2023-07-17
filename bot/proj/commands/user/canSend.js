const { users } = require("../../database/models");

async function canSend(chat_id) {
  const user = await users.findOne({ where: { chat_id } });
  return !!(user !== null && user?.status);
}

module.exports = {
  canSend,
};
