

// backend/middleware/validate.js
const Joi = require('joi');

/**
 * Middleware generator for validating req.body against a Joi schema.
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({ error: details });
    }
    next();
  };
}

module.exports = validate;