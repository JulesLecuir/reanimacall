require('colors');

module.exports = {
    info: (str) => console.info(str.blue),
    success: (str) => console.info(str.green),
    log: (str) => console.log(str),
    debug: (str) => console.debug(`${new Date().toLocaleTimeString()} - DEBUG: ${str}`),
    warn: (str) => console.warn(`${new Date().toLocaleTimeString()} - WARN: ${str}`.yellow),
    error: (err, str) => console.error((str ? `--------------\n${new Date().toLocaleTimeString()} - ERROR: ${str}\n` : `--------------\n${new Date().toLocaleTimeString()} - `).red + `${err.stack}\n--------------`.red)
};

/* FOR TEST PURPOSE :
LOG.success('Connected to database');
LOG.log('Connected to database');
LOG.debug('Connected to database');
LOG.warn('Connected to database');
LOG.error(TypeError("Something"));
LOG.error(TypeError("Something"), 'Error occurred');
 */