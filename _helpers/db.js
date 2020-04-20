const mongoose = require('mongoose');

module.exports = {
    connect: async (db_name) => {
        await mongoose.connect(process.env.DB_HOST + db_name, {
            useCreateIndex: true,
            useNewUrlParser: true
        });
        mongoose.Promise = global.Promise;
        return mongoose.connection;
    },
    getConnection: () => mongoose.connection
};

