const { tasks } = require('../../database/models')
const { Op } = require('sequelize')

function setUTC (date) {
  // устанавливает utc Екатеринбурга
  const hour =
    date.getTimezoneOffset() > 0
      ? date.getTimezoneOffset() / 60
      : (date.getTimezoneOffset() / 60) * -1
  date.setHours(date.getHours() + hour)
  return date
}

async function getTaskForToday (chat_id, date) {
  const options = { timeZone: 'Asia/Yekaterinburg' }
  const formattedDate = date.toLocaleString('en-US', options)
  const parsed = Date.parse(formattedDate)

  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setUTCHours(23, 59, 59, 999)

  console.log(start)
  console.log(end)

  const task = await tasks.findOne({
    where: {
      chat_id,
      date: {
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
