require('./schedule');
const {morning, evening, WeekReport, times, last_times,time_for_work_1, time_for_work_2, time_for_work_3} = require('./Keyboard');
const {personal, reports, vacation_aprove, not_working, current_task} = require('./database/models')
const {webAppUrl, token} = require('./ProjectConfig')

const sequelize = require('./database/db')
const TelegramBot = require('node-telegram-bot-api')

const { Op, QueryTypes} = require('sequelize')
const cron = require('node-cron')

const {format} = require('date-fns')

console.log('bot has been started . . .')
const bot = new TelegramBot(token, { polling: true})
bot.on("polling_error", console.log);

// Время конца дня
const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999); // Установка времени конца дня
const timer = setTimeout(() => {
  sequelize.query(`UPDATE Current_task SET tasks = '{}'`,)
}, endOfDay - new Date());

//Тут я кароче че-то делаю доброе утро
let reply1 = new Map()
let reply2 = new Map()
let reply3 = new Map()  
let reply4 = new Map()
let reply5 = new Map()
  
//факт за неделю
bot.on('callback_query',  async (query) => {
    const { data, message } = query;
    if (data === 'Подтвердить') {
      await bot.sendMessage(message.chat.id, 'Принято');
     
      console.log(query.from.id, ',', message.chat.id);
    }
  });

//Факт за неделю командой
bot.onText(/\/weeks/, async msg => {
          try {
            const report = await reports.findAll({
              attributes: ['fact', 'date'],
              order: ['date'],
              where: {
                chat_id: msg.chat.id,
                date: {
                  [Op.and]: {
                    [Op.gte]: format(
                      new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
                      'yyyy-MM-dd'
                    ),
                    [Op.lt]: format(new Date(), 'yyyy-MM-dd')
                  }
                }
              },
              raw: true
            });
    
            let abs = '';
            report.forEach((rep) => {
              const dateWithWeekday = new Date(rep.date).toLocaleString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              abs += dateWithWeekday + '\n' + ' ' + rep.fact + '\n' + '\n';
            });
    
            await bot.sendMessage(msg.chat.id, 'Твой отчёт за неделю:');
            const mes = await bot.sendMessage(msg.chat.id, abs, WeekReport);
    
            await bot.editMessageReplyMarkup(
              {
                inline_keyboard: [
                  [
                    {
                      text: 'Подтвердить',
                      callback_data: 'Подтвердить'
                    },
                    {
                      text: 'Есть ошибки',
                      web_app: {
                        url:
                          webAppUrl +
                          'weekly_report.php?message_id=' +
                          mes.message_id
                      }
                    }
                  ]
                ]
              },
              { chat_id: mes.chat.id, message_id: mes.message_id }
            );
    
            await bot.sendMessage(
                msg.chat.id,
              'Если все в порядке - нажмите "Подтвердить". Если нет - нажмите "Есть ошибки" для отправки уведомления'
            );
          } catch (err) {
              bot.sendMessage(msg.chat.id, "Фактов за прошлую неделю не найдено")
          }
  });
  

//Реакция на клавы
bot.on('callback_query', (query) =>{
    if (query.data === 'Ввести план на день'){     
        bot.sendMessage(query.message.chat.id, 'Ваш план на день:', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => {
            bot.removeReplyListener(reply1.get(query.message.chat.id));
            reply1.set(query.message.chat.id, 
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET tasks = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,   
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'Ваш план принят',);
                    bot.removeReplyListener(reply1.get(query.message.chat.id));
                    reply1.delete(query.message.chat.id);
                })
            )
        }) 
    } 
    else if (query.data === 'Сегодня не работаю'){
        bot.sendMessage(query.message.chat.id, 'Введите причину:', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => {
            bot.removeReplyListener(reply2.get(query.message.chat.id));
            reply2.set(query.message.chat.id, 
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'Ваша причина принята',);
                    bot.removeReplyListener(reply2.get(query.message.chat.id));
                    reply2.delete(query.message.chat.id);
                })
            )     
        })
    }
    else if (query.data === 'Ввести факт'){  
        bot.sendMessage(query.message.chat.id, 'Ваш факт за день:', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => { 
            bot.removeReplyListener(reply3.get(query.message.chat.id)); 
            reply3.set(query.message.chat.id,
                bot.onReplyToMessage(msg.chat.id, msg.message_id, async reply => {
                    sequelize.query("UPDATE reports SET fact = $2, worked = 'Y', hours = 8 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    const mes = await bot.sendMessage(query.message.chat.id, 'У тебя был полный рабочий день?', times);
                    await bot.editMessageReplyMarkup({               
                        inline_keyboard: [
                            [{
                                text: 'Полный рабочий день',
                                callback_data: 'Полный рабочий день'
                            },{
                                text: 'Ввести часы работы',
                                web_app:{url: webAppUrl+'clock.php?date='+format(new Date(),'yyyy-MM-dd')+'&message_id='+(mes.message_id)}
                                
                            }]
                        ]
                    }, {chat_id: mes.chat.id, message_id: mes.message_id});
                    bot.removeReplyListener(reply3.get(query.message.chat.id));
                    reply3.delete(query.message.chat.id);
                })
            )
        })                             
    }
    else if (query.data === 'Сегодня не работал'){
        bot.sendMessage(query.message.chat.id, 'Введите причину', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => { 
            bot.removeReplyListener(reply4.get(query.message.chat.id));
            reply4.set(query.message.chat.id,     
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'Ваша причина принята',);
                    bot.removeReplyListener(reply4.get(query.message.chat.id));
                    reply4.delete(query.message.chat.id);
                })
            )
        }) 
    }
    else if(query.data === 'Полный рабочий день'){  
        sequelize.query("UPDATE reports SET hours = '8' WHERE chat_id = $1 AND date = $2", {
            bind:[query.message.chat.id,format(new Date(),'yyyy-MM-dd')],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'Ваш факт принят',);        
    }
    else if(query.data === 'Полный рабочий день вчера'){  
        sequelize.query(`UPDATE reports SET hours = '8' WHERE chat_id= $1 AND "ID" = (
            SELECT "ID" FROM reports WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1 OFFSET 1
          )`, {
            bind:[query.message.chat.id],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'Ваш факт принят',);        
    }
    else if(query.data === 'vacation_aprove') { (async function vacation(text, id) {
        const vacation_id = await text.match(/\[#(.*)\]/)[1];
        await sequelize.query("INSERT INTO not_working(chat_id, start, \"end\", status) SELECT chat_id, start, \"end\", status FROM vacation_aprove WHERE id = $1", {
            bind:[vacation_id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        })
        bot.sendMessage(id, 'Отпуск одобрен',);
        await vacation_aprove.findOne({where:{id: vacation_id}, raw: true })
        .then(vacation => {
            bot.sendMessage(vacation.chat_id, 'Заявка на отпуск с '+vacation.start+' по '+vacation.end+' была одобрена');
        }).catch(err=> console.log(err));
    }(query.message.text, query.message.chat.id))
    }
    else if(query.data === 'vacation_!aprove') { (async function vacation(text, id) {
        const vacation_id = await text.match(/\[#(.*)\]/)[1];
        bot.sendMessage(id, 'Отпуск отклонен',);
        await vacation_aprove.findOne({where:{id: vacation_id}, raw: true })
        .then(vacation => {
            bot.sendMessage(vacation.chat_id, 'Заявка на отпуск с '+vacation.start+' по '+vacation.end+' была отклонена');
        }).catch(err=> console.log(err));
    }(query.message.text, query.message.chat.id))
    }
    else if(query.data === 'day_aprove') { (async function vacation(text, id) {
        const vacation_id = await text.match(/\[#(.*)\]/)[1];
        await sequelize.query("INSERT INTO not_working(chat_id, start, \"end\", status) SELECT chat_id, start, \"end\", status FROM vacation_aprove WHERE id = $1", {
            bind:[vacation_id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        })
        bot.sendMessage(id, 'Заявка одобрена',);
        await vacation_aprove.findOne({where:{id: vacation_id}, raw: true })
        .then(vacation => {
            bot.sendMessage(vacation.chat_id, 'Заявка на день/дни без содержания с '+vacation.start+' по '+vacation.end+' была одобрена');
        }).catch(err=> console.log(err));
    }(query.message.text, query.message.chat.id))
    }
    else if(query.data === 'day_!aprove') { (async function vacation(text, id) {
        const vacation_id = await text.match(/\[#(.*)\]/)[1];
        bot.sendMessage(id, 'Заявка отклонена',);
        await vacation_aprove.findOne({where:{id: vacation_id}, raw: true })
        .then(vacation => {
            bot.sendMessage(vacation.chat_id, 'Заявка на день/дни без содержания с '+vacation.start+' по '+vacation.end+' была отклонена');
        }).catch(err=> console.log(err));
    }(query.message.text, query.message.chat.id))
    }
    else if(query.data === '9:00 - 18:00'){  
        sequelize.query("UPDATE personals SET time_for_work = '0' WHERE chat_id = $1", {
            bind:[query.message.chat.id],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'Ваш рабочий график: 9:00 - 18:00',);        
    }
    else if(query.data === '8:00 - 17:00'){  
        sequelize.query("UPDATE personals SET time_for_work = '-1' WHERE chat_id = $1", {
            bind:[query.message.chat.id],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'Ваш рабочий график: 8:00 - 17:00',);        
    }
    else if(query.data === '10:00 - 19:00'){  
        sequelize.query("UPDATE personals SET time_for_work = '+1' WHERE chat_id = $1", {
            bind:[query.message.chat.id],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'Ваш рабочий график: 10:00 - 19:00',);        
    }
    bot.editMessageReplyMarkup({reply_markup: JSON.stringify({keyboard: []})}, {chat_id: query.message.chat.id, message_id: query.message.message_id});
})
//Ввод плана командой
bot.onText(/\/workstart/, async msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
          .then(async user => {
              if (user && user.active == 'Y') {
      if(new Date().getDay() != (6 || 0)){
          await sequelize.query("INSERT INTO reports(date, chat_id,time_for_work, worked) SELECT $1, $2,(SELECT CASE WHEN time_for_work = '-1' THEN '-1' WHEN time_for_work = '0' THEN '0' WHEN time_for_work = '+1' THEN '+1' END FROM personals WHERE chat_id = $2), 'N' WHERE NOT EXISTS (SELECT * FROM reports WHERE date = $1 AND chat_id = $2) AND EXISTS (SELECT * FROM personals WHERE chat_id = $2 AND active = 'Y')", {
              bind:[format(new Date(),'yyyy-MM-dd'),msg.chat.id],
              model: reports,   
              mapToModel: true,
              type: Op.SELECT,
          });
          await reports.findOne({where:{chat_id: msg.chat.id, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
          .then(user=>{
              if (user && user.tasks == null && user.fact == null){
                  bot.sendMessage(user.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning);
              } else {
                  bot.sendMessage(msg.chat.id, 'План/факт уже введен');
              }
          }).catch(err=>console.log(err));
      } else {
          bot.sendMessage(msg.chat.id, 'Вы не можете использовать эту команду в выходные');
      }
    
  } else {
                  bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
              }
          })
          .catch(err => console.log(err));
  }) 
  
  // //Ввод факта командой
  
  bot.onText(/\/workend/, async msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
          .then(async user => {
              if (user && user.active == 'Y') {
      if (new Date().getDay() != (6 || 0)) {
          const [instance, created] = await reports.findOrCreate({
              where: { chat_id: msg.chat.id, date: format(new Date(), 'yyyy-MM-dd') },
              defaults: { worked: 'N' }
          });
          const prevEntry = await reports.findOne({
              where: { chat_id: msg.chat.id },
              order: [['created_at', 'DESC']],
              offset: 1,
              limit: 1
          });
          if ((prevEntry && prevEntry.fact === null)&&(created || instance.fact === null)) {
              bot.sendMessage(msg.chat.id, 'Вы не заполнили факт за предыдущий рабочий день. Заполните его сейчас:', {
                  reply_markup: JSON.stringify({ force_reply: true }),
              }).then(msg => { 
                  bot.removeReplyListener(reply5.get(msg.chat.id)); 
                  reply5.set(msg.chat.id,
                      bot.onReplyToMessage(msg.chat.id, msg.message_id, async reply => {
                          const datexyu = await sequelize.query(
                              `UPDATE reports SET fact = $2, worked = 'Y' WHERE chat_id = $1 AND "ID" = (
                                SELECT "ID" FROM reports WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1 OFFSET 1
                              ) RETURNING date`, {
                              bind:[reply.chat.id,reply.text],
                              model: reports,
                              mapToModel: true,
                              type: Op.UPDATE,
                          });
                          const mes = await bot.sendMessage(msg.chat.id, 'У тебя был полный рабочий день?', last_times);
                          await bot.editMessageReplyMarkup({               
                              inline_keyboard: [
                                  [{
                                      text: 'Полный рабочий день',
                                      callback_data: 'Полный рабочий день вчера'
                                  },{
                                      text: 'Ввести часы работы',
                                      web_app:{url: webAppUrl+'clock.php?date='+datexyu[0].date+'&message_id='+(mes.message_id)}
                                      
                                  }]
                              ]
                          }, {chat_id: mes.chat.id, message_id: mes.message_id});
                          bot.removeReplyListener(reply5.get(msg.chat.id));
                          reply5.delete(msg.chat.id);
                      })
                  )
              })         
              
              
          } 
          else {
              if (created || instance.fact === null) {
                current_task.findOne({where:{ chat_id: msg.chat.id}, raw: true })
                .then(async user=>{
                 if (!user || !user.tasks.join('\n')) { 
                    
                  return  bot.sendMessage(msg.chat.id, 'Готов отчитаться за день?',evening);  
                }    
                else{
                await bot.sendMessage(msg.chat.id,` Ваши записи за сегодня:\n${user.tasks.join('\n')}` ) ; 
                await bot.sendMessage(msg.chat.id, 'Готов отчитаться за день?',evening)  
                }                
                
                }).catch(err=>console.log(err));
              }
              else {
                  bot.sendMessage(msg.chat.id, 'Факт уже введен');
              }
          }
      } else {
      bot.sendMessage(msg.chat.id, 'Вы не можете использовать эту команду в выходные');
      }
    
  } else {
                  bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
              }
          })
          .catch(err => console.log(err));
  });

//Блок авторизации
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id;
    
    const reqPhone = {
        reply_markup: {
            remove_keyboard: true,
            keyboard: [
                [{
                    text: "Отправить мой номер",
                    request_contact: true,                   
                }],
                ["Отмена"]
            ]
        }
    }

    try {
        sequelize.authenticate(
            sequelize.sync(),
            console.log('db  in')
        )
    } catch (e) {
        console.log('db  errors')
    }

    function check_id() {
        const isIdUnique = chat_id =>
            personal.findOne({ where: { chat_id }, attributes: ['chat_id'] })
            .then(token => token !== null)
            .then(isUnique => isUnique);

        const isIdUniqueAccess = access_level =>
            personal.findOne({ where: { [Op.and]: [{ access_level }, { chat_id: msg.chat.id}] }, attributes: ['chat_id'] })
            .then(isIdUniqueAccess => isIdUniqueAccess);

        isIdUnique(chatId).then(isUnique => {
            if (isUnique) {
                bot.sendMessage(chatId, 'Вы можете начать работать с ботом', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })

                isIdUniqueAccess(1).then(isIdUniqueAccess => {
                    if (isIdUniqueAccess) {
                        bot.sendMessage(chatId, 'Ваш уровень доступа: стандартный')
                    } else {
                        bot.sendMessage(chatId, 'У вас есть права администратора')
                    }
                })
            } else {
                bot.sendMessage(chatId, 'Вас нет в списке, отправьте номер ', reqPhone)

                bot.once('contact', msg => {
                    const telUser = msg.contact.phone_number.replace('+', '')

                    function check_num() {

                        const isIdUnique = number_phone =>
                            personal.findOne({ where: { number_phone }, attributes: ['number_phone'] })
                            .then(token => token !== null)
                            .then(isUnique => isUnique);

                        isIdUnique(telUser).then(isUnique => {
                            if (isUnique) {
                                bot.sendMessage(chatId, 'Вы можете начать работать с ботом', {
                                    reply_markup: {
                                        remove_keyboard: true
                                    }
                                })
                                sequelize.query("UPDATE personals SET chat_id = $2 WHERE number_phone = $1", {
                                    bind: [telUser, chatId],
                                    model: personal,
                                    mapToModel: true,
                                    type: Op.SELECT,
                                })

                            } else {
                                bot.sendMessage(chatId, 'Вас нет в списке, обратьтесь к администратору')
                            }
                        })
                    }
                    if (msg.chat.id === chatId) {
                        check_num()
                    }
                })
            }
        })
    }

    check_id()
})
  
   //Редактирование последнего сообщения
   bot.onText(/\/edit_last_message/, async (msg) => { 
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
   .then(async user => {
       if (user && user.active == 'Y'){
         
   const { chat: { id } } = msg; 
   const maxId = await reports.max('ID',{where:{chat_id: id}})
   const lastReport = await reports.findOne({ 
       where: { chat_id: id }, 
       order: [['created_at', 'DESC']], 
       limit: 1, 
   }); 
   let lastMessage; 
   let column; 
   let date;
   let twork;
   if (lastReport) { 
   
       if (lastReport.tasks && lastReport.fact) { 
           if (lastReport.tasks_updated_at > lastReport.fact_updated_at) { 
               lastMessage = lastReport.tasks; 
               column = 'tasks'; 
               date = lastReport.date;
               twork = 'План '
           } else { 
               lastMessage = lastReport.fact; 
               column = 'fact'; 
               date = lastReport.date;
               twork = 'Факт '
           } 
       } else if (lastReport.tasks) { 
           lastMessage = lastReport.tasks; 
           column = 'tasks'; 
           date = lastReport.date;
           twork = 'План '
       } else if (lastReport.fact) { 
           lastMessage = lastReport.fact; 
           column = 'fact'; 
           date = lastReport.date;
           twork = 'Факт '
       } 

       if (lastReport.created_at) {
           date = new Date(lastReport.created_at);
       }
   } 

   if (!lastMessage) { 
       return bot.sendMessage(id, 'Не найдено ни одного сообщения'); 
   } 

   const messageText = date ? `Последнее сообщение - ${twork} за ${date}: \n${lastMessage}\nВведите новое сообщение:` : `Последнее сообщение (из колонки ${column}): ${lastMessage}\nВведите новое сообщение:`;

   bot.sendMessage(id, messageText, { 
       reply_markup: { 
       force_reply: true, 
       }, 
   }).then((reply) => { 
       bot.onReplyToMessage(id, reply.message_id, async (newMsg) => { 
           await reports.update( 
               { [column]: newMsg.text }, 
               { where: { chat_id: id, [column]: lastMessage , ID: maxId} } 
           ); 

           bot.sendMessage(id, `Сообщение отредактировано:\n${newMsg.text}`); 
       }); 
   }); 
    } else {
           bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
       }
   }).catch(err=> console.log(err));
});



//Вывод сотрудников твоей команды

bot.onText(/\/employes/, async (msg) => {
    const { chat: { id }, from: { id: userId } } = msg;
  try {
    const user = await personal.findOne({ where: { chat_id: userId } });
    if (!user || user.access_level <= 1) {
      return bot.sendMessage(id, 'У вас нет доступа к этой команде');
    }
      const employees = await sequelize.query(
        `SELECT full_name, post FROM personals WHERE 'Без команды' != any(team) AND team && (SELECT team FROM personals WHERE chat_id = $1)`, {
        bind:[msg.chat.id],
        model: personal,
        mapToModel: true,
        type: QueryTypes.SELECT,
    }); 
    if (employees.length === 0) { 
      return bot.sendMessage(id, 'Вы не состоите ни в какой команде');  
    }   
    const employeeList = employees.map(emp => `${emp.full_name} (${emp.post})`).join('\n'); 
    const message = `Твоя команда:\n${employeeList}`; 
    bot.sendMessage(id, message); }
  
  catch (err) {
        console.log(err)
    }
  });
  
//Отпуск

bot.onText(/\/vacation/, msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
    .then(async user => {
        if (user && user.active == 'Y'){
            const mes = await bot.sendMessage(user.chat_id, 'Выбери дату отпуска', {
                reply_markup:{
                    inline_keyboard:[
                        [{text: 'Выбрать', web_app:{url: webAppUrl+'vacation.php'}}]
                    ]
                }
            });
            await bot.editMessageReplyMarkup({               
                inline_keyboard: [
                    [{
                        text: 'Выбрать',
                        web_app:{url: webAppUrl+'vacation.php?message_id='+mes.message_id}
                        
                    }]
                ]
            }, {chat_id: mes.chat.id, message_id: mes.message_id});
        } else {
            bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
        }
    }).catch(err=> console.log(err));
}) 

//День

bot.onText(/\/take_a_day/, msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
    .then(async user => {
      
        if (user && user.active == 'Y'){
          if (user.working == 'Y' ){
            const mes = await bot.sendMessage(user.chat_id, 'Выбери дату', {
                reply_markup:{
                    inline_keyboard:[
                        [{text: 'Выбрать', web_app:{url: webAppUrl+'take_a_day.php'}}]
                    ]
                }
            });
            await bot.editMessageReplyMarkup({               
                inline_keyboard: [
                    [{
                        text: 'Выбрать',
                        web_app:{url: webAppUrl+'take_a_day.php?message_id='+mes.message_id}
                        
                    }]
                ]
            }, {chat_id: mes.chat.id, message_id: mes.message_id});
        }
          else {
            bot.sendMessage(msg.chat.id, 'Вы не можете использовать эту команду во время больничного/отпуска');
        }
        } else {
            bot.sendMessage(msg.chat.id, 'Вы не можете использовать эту команду ');
        }
    }).catch(err=> console.log(err));
}) 

bot.onText(/\/sick/, msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
    .then(async user => {
        if (user && user.active == 'Y'){
            sequelize.query(`INSERT INTO not_working(chat_id, start, "end", status) select $1, $2, $2, 'S' WHERE NOT EXISTS (SELECT * FROM not_working WHERE start <= $2 AND "end" >= $2 AND chat_id = $1)`, {
                bind:[user.chat_id, format(new Date(),'yyyy-MM-dd'),],
                mapToModel: true,
                type: Op.SELECT,
            })
            const mes = await bot.sendMessage(user.chat_id, 'Выбери дату приема', {
                reply_markup:{
                    inline_keyboard:[
                        [{text: 'Выбрать', web_app:{url: webAppUrl+'sick.php'}}]
                    ]
                }
            });
            await bot.editMessageReplyMarkup({               
                inline_keyboard: [
                    [{
                        text: 'Выбрать',
                        web_app:{url: webAppUrl+'sick.php?message_id='+mes.message_id}
                        
                    }]
                ]
            }, {chat_id: mes.chat.id, message_id: mes.message_id});
        } else {
            bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
        }
    }).catch(err=> console.log(err));
})

bot.onText(/\/work_time/, msg => {
    personal.findOne({where:{chat_id: msg.chat.id}, raw: true })
    .then(async user => {
        if (user && user.active == 'Y'){
            if (user.time_for_work == '-1'){
                await bot.sendMessage(msg.chat.id,'Текущее время работы: \n8:00 - 17:00\nВыберите новое время работы:',time_for_work_1)
            }
            else if (user.time_for_work == '0'){
                await bot.sendMessage(msg.chat.id,'Текущее время работы: \n9:00 - 18:00\nВыберите новое время работы:',time_for_work_2)
            }
            else if (user.time_for_work == '+1'){
                await bot.sendMessage(msg.chat.id,'Текущее время работы: \n10:00 - 19:00\nВыберите новое время работы:',time_for_work_3)
            }
        }
        else {
            bot.sendMessage(msg.chat.id, 'Вы больше не можете использовать эту команду');
            }
    }).catch(err=> console.log(err));
})

// Текущая задача
bot.onText(/\/current_task/, async (msg) => {
    const userId = msg.from.id;
    
    await sequelize.query(`INSERT INTO current_task (chat_id, tasks) SELECT $1, '{}' WHERE  NOT EXISTS (SELECT * FROM current_task WHERE chat_id = $1)`, {
        bind: [userId],
    });
  bot.sendMessage(msg.chat.id, 'Введите сообщение для записи:');
  bot.once('message', async (message) => {
    const userMessage = message.text;
    await sequelize.query(`UPDATE current_task SET tasks = array_append(tasks, $2) WHERE chat_id = $1`, {
      bind: [userId, userMessage],
    });
    bot.sendMessage(msg.chat.id, 'Запись сохранена. Для добавления новой записи введите /current_task');
  });
});