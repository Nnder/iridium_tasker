const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'postgres://grimksi:4QbYXDPrdy9k@ep-wispy-heart-761564.eu-central-1.aws.neon.tech/neondb?ssl=true',
    {
        host:'ep-wispy-heart-761564.eu-central-1.aws.neon.tech',
        port: '5432',
        dialect: 'postgres',
        define: {
            timestamps: false
        }
    }
)