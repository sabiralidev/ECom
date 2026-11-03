const sendSuccess = (res, data, statusCode = 200) =>
    res.status(statusCode).json({ data });

const sendError = (res, statusCode, code, message) =>
    res.status(statusCode).json({ message, code });

module.exports = { sendError, sendSuccess };
