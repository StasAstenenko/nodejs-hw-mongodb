import Joi from 'joi';

export const contactsValidationScheme = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  phoneNumber: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Phone number should have at least {#limit} characters',
    'string.max': 'Phone number should have at most {#limit} characters',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().min(3).max(20).email().messages({
    'string.min': 'Email have at least {#limit} characters',
    'string.max': 'Email number should have at most {#limit} characters',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.required': 'Type of contact is required',
    }),
});

export const contactsValidationSchemeForPatch = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.min': 'Username have at least {#limit} characters',
    'string.max': 'Username number should have at most {#limit} characters',
  }),
  phoneNumber: Joi.string().min(3).max(20).messages({
    'string.min': 'Phone number have at least {#limit} characters',
    'string.max': 'Phone number number should have at most {#limit} characters',
  }),
  email: Joi.string().min(3).max(20).messages({
    'string.min': 'Email have at least {#limit} characters',
    'string.max': 'Email number should have at most {#limit} characters',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().min(3).max(20).valid('work', 'home', 'personal'),
});
