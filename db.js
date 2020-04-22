const mongoose = require('mongoose');
const LOG = require('./_helpers/LOG');

module.exports = {
    connect: async (db_name) => {
        await mongoose
            .connect(process.env.DB_HOST + db_name, {
                useUnifiedTopology: true,
                useCreateIndex: true,
                useNewUrlParser: true
            })
            .then(() => LOG.success('Connected to database'))
            .catch((err) => LOG.error(err));
        mongoose.Promise = global.Promise;
        return mongoose.connection;
    },
    getConnection: () => mongoose.connection
};