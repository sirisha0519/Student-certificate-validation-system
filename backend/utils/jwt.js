import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token for a specific user ID and role.
 * @param {string} userId - The user ID to encode.
 * @param {string} role - The role of the user (e.g. Admin, Student).
 * @returns {string} - Signed JWT token.
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
