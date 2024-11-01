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
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const contactsRouter = Router();
const jsonParser = express.json();

contactsRouter.use(authenticate);

contactsRouter.get('/', ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', isValidId, ctrlWrapper(getContactController));

contactsRouter.post(
  '/',
  jsonParser,
  upload.single('photo'),
  validateBody(contactsValidationScheme),
  ctrlWrapper(createContactController),
);

contactsRouter.patch(
  '/:contactId',
  jsonParser,
  upload.single('photo'),
  isValidId,
  validateBody(contactsValidationSchemeForPatch),
  ctrlWrapper(updateContactController),
);

contactsRouter.delete(
  '/:contactId',
  jsonParser,
  isValidId,
  ctrlWrapper(deleteContactController),
);

export default contactsRouter;
