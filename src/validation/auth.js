import Joi from 'joi';

export const registerUsersScheme = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have at least {#limit} characters',
    'string.max': 'Name should have at most {#limit} characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const loginUserValidationScheme = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const requestResetAuthScheme = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
  }),
});

export const resetPasswordScheme = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});
