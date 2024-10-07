import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino-http';
import cors from 'cors';
import { getAllContacts, getContactsById } from './services/contacts.js';

dotenv.config();

const PORT = Number(process.env.PORT);

export const setupServer = () => {
  const app = express();

  app.use(express.json());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(cors());

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).send({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactsById(contactId);

    if (!contact) {
      res.status(404).json({
        message: 'Contact not found',
      });
      return;
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully found contact with id {contactId}!',
      data: contact,
    });
  });

  app.get('/', (req, res) => {
    res.json({ message: 'Server is enable' });
  });

  app.use((req, res, next) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
