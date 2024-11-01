import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { env } from '../utils/utils.js';
import { UserCollections } from '../db/models/usersScheme.js';
import createHttpError from 'http-errors';
import { SessionsCollections } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  SMTP,
  TEMPLATES_DIR,
  THIRTY_DAYS,
} from '../constants/index.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (payload) => {
  const user = await UserCollections.findOne({ email: payload.email });

  if (user !== null) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const registeredUser = await UserCollections.create({
    ...payload,
    password: encryptedPassword,
  });

  return registeredUser;
};

export const loginUser = async (payload) => {
  const user = await UserCollections.findOne({ email: payload.email });

  if (!user) throw createHttpError(404, 'User not found');

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollections.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollections.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const logOutUser = async (sessionId) => {
  await SessionsCollections.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollections.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, 'Session not found');

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollections.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return await SessionsCollections.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UserCollections.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign({ sub: user._id, email }, env('JWT_SECRET'), {
    expiresIn: '5m',
  });

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env('JWT_SECRET'));

    const user = await UserCollections.findOne({
      email: entries.email,
      _id: entries.sub,
    });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UserCollections.findByIdAndUpdate(
      { _id: user._id },
      { password: encryptedPassword },
    );
    await SessionsCollections.deleteOne({ _id: user._id });
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw err;
  }
};
