const {CronJob, bot} = require("../index");

function startCron(){
    let job = new CronJob('00 05 10', ()=>{
        bot.sendMessage(1627953478, "cron is working")
    })
    job.start();
}

module.exports = {
    startCron
}
