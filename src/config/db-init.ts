import { User } from "../models/user.model";

const isDev = process.env.NODE_ENV === 'development';

export const dbInit = () => {
  User.sync({ alter: isDev });
}
