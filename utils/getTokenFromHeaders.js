const getTokenFromHeaders = req => {
    const {
        headers: { authorization }
    } = req;

    return authorization;
};

module.exports = getTokenFromHeaders;
