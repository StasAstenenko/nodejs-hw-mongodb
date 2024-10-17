import express, { Router } from 'express';
import {
  createContactController,
  deleteContactController,
  getContactController,
  getContactsController,
  updateContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  contactsValidationScheme,
  contactsValidationSchemeForPatch,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';

const router = Router();
const jsonParser = express.json();

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', isValidId, ctrlWrapper(getContactController));

router.post(
  '/',
  jsonParser,
  validateBody(contactsValidationScheme),
  ctrlWrapper(createContactController),
);

router.patch(
  '/:contactId',
  jsonParser,
  isValidId,
  validateBody(contactsValidationSchemeForPatch),
  ctrlWrapper(updateContactController),
);

router.delete(
  '/:contactId',
  jsonParser,
  isValidId,
  ctrlWrapper(deleteContactController),
);

export default router;
