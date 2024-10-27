import mongoose, { Schema } from 'mongoose';

const usersScheme = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

usersScheme.methods.toJSON = function () {
  const object = this.toObject();
  delete object.password;
  return object;
};

export const UserCollections = mongoose.model('users', usersScheme);
