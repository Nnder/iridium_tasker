const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    // 'postgres://grimksi:4QbYXDPrdy9k@ep-wispy-heart-761564.eu-central-1.aws.neon.tech/neondb?ssl=true',
    'postgres://postgres:Zd3NNXXkI3JGoDnoXGCD@containers-us-west-3.railway.app:7251/railway',
    {
        host:'containers-us-west-3.railway.app',
        port: '7251',
        dialect: 'postgres',
        define: {
            timestamps: false
        }
    }
)


// localdb

// module.exports
// {
//     const sequelize = new Sequelize(
//         'localdb',
//         'admin',
//         'gA2fsahaf',
//         {
//             host: 'localhost',
//             dialect: 'postgres',
//             timestamps: false
//         }
//     );
// }