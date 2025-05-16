// token-hook.js
module.exports = {
  beforeRequest: (req, context, ee, next) => {
    if (req.headers && context.vars.authToken) {
      req.headers.Authorization = `Bearer ${context.vars.authToken}`;
    }
    return next();
  }
};