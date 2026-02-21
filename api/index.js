const handleRequest = require('../server/server');

module.exports = (req, res) => {
    return handleRequest(req, res);
};
