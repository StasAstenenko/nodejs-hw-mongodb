import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactsById,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/utils.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const contacts = await getAllContacts({
    userId: req.user._id,
    page,
    perPage,
    sortBy,
    sortOrder,
  });

  res.status(200).send({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactsById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully found contact with id {contactId}!',
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const photo = req.file;

  let photoUrl;

  if (photo) {
    photoUrl = await saveFileToUploadDir(photo);
  }

  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    isFavourite: req.body.isFavourite,
    contactType: req.body.contactType,
    userId: req.user._id,
    photo: photoUrl,
  };

  const result = await createContact(contact);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact',
    data: result,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;

  const result = await updateContact(contactId, req.body, req.user._id);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = updateContact(contactId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully patched a student!`,
    data: result.student,
  });
};
