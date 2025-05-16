const client = require('../redisClient');

module.exports = async (req, res, next) => {
  if (req.method !== 'GET') {
    return next(); // cache uniquement sur GET
  }

  const key = req.originalUrl;

  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      client.setEx(key, 3600, JSON.stringify(body)); // expire en 1h
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error('Cache error:', err);
    next();
  }
};