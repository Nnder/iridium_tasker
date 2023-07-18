const { bot, webAppUrl } = require('../../index')
const { tasks, users } = require('../../database/models')
async function addHours (msg, task) {
  const chat_id = msg.chat.id
  const { message_id } = await bot.sendMessage(
    chat_id,
    'У тебя был полный день?'
  )

  const fullDay = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Полный день',
            callback_data: JSON.stringify({
              type: 'Full day',
              id: chat_id,
              tid: task.id
            })
          },
          {
            text: 'Не полный день',
            web_app: {
              url: `${webAppUrl}/time.html?user=${chat_id}&task=${task.id}&mid=${message_id}`
            }
          }
        ]
      ]
    }
  }

  await bot.editMessageReplyMarkup(fullDay.reply_markup, {
    chat_id,
    message_id
  })

  const timer = setTimeout(
    async () => {
      // из-за того что не могу получить по id сообщение пришлось изворачиваться
      try {
        const timerTask = await tasks.findOne({ where: { id: task.id } })

        if (timerTask.hours == null) {
          const user = await users.findOne({ where: { chat_id } })

          const split = user.work_time.split('-')
          const from = split[0].split(':')
          const to = split[1].split(':')

          const time = new Date()
          time.setHours(to[0] - from[0], to[1] - from[1])

          const result = `${
            time.getHours() > 10 ? time.getHours() : '0' + time.getHours()
          }:${
            time.getMinutes() > 10 ? time.getMinutes() : '0' + time.getMinutes()
          }`
          await timerTask.update({ hours: result })

          await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id, message_id }
          )
          await bot.sendMessage(chat_id, `Введен полный день ${result}`)
        } else {
          console.log('Клавиатура уже была изменена')
        }
      } catch (e) {
        console.log('Клавиатура уже была изменена')
      }
    },
    1000 * 60 * 60 * 2
  )
}

module.exports = {
  addHours
}
