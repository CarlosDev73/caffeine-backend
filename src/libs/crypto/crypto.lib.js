import crypto from 'crypto';

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex'); // Generate a 32-byte secure token
};
