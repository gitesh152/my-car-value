import Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('test', 'development', 'production').required(),

  PORT: Joi.number().default(3000),

  COOKIE_KEY: Joi.string().required(),

  DUMMY_PASSWORD: Joi.string().required(),

  SUPERADMIN_EMAIL: Joi.string().email().required(),

  DB_NAME: Joi.string().required(),

  //prod only db config

  DB_HOST: Joi.when('NODE_ENV', {
    is: 'production',
    otherwise: Joi.string().optional(),
  }).required(),

  DB_PORT: Joi.when('NODE_ENV', {
    is: 'production',
    otherwise: Joi.number().optional(),
  }).required(),

  DB_USER: Joi.when('NODE_ENV', {
    is: 'production',
    otherwise: Joi.string().optional(),
  }).required(),

  DB_PASS: Joi.when('NODE_ENV', {
    is: 'production',
    otherwise: Joi.string().optional(),
  }).required(),
});
