import express, { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginUserValidationScheme,
  registerUsersScheme,
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  loginUserController,
  logOutUserController,
  refreshUsersSessionController,
  registerUserController,
} from '../controllers/auth.js';

const authRouter = Router();
const jsonParser = express.json();

authRouter.post(
  '/register',
  jsonParser,
  validateBody(registerUsersScheme),
  ctrlWrapper(registerUserController),
);

authRouter.post(
  '/login',
  jsonParser,
  validateBody(loginUserValidationScheme),
  ctrlWrapper(loginUserController),
);

authRouter.post('/logout', jsonParser, ctrlWrapper(logOutUserController));

authRouter.post(
  '/refresh',
  jsonParser,
  ctrlWrapper(refreshUsersSessionController),
);

export default authRouter;
