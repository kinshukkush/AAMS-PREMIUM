const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = { id: user._id };
  if (user.isDefaultPassword) {
    payload.isDefaultPassword = true;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const userData = {
    id: user._id,
    name: user.name,
    role: user.role,
    enrollmentId: user.enrollmentId,
    section: user.section,
    semester: user.semester,
    isDefaultPassword: user.isDefaultPassword
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, cookieOptions)
    .json({
      success: true,
      message,
      token: accessToken,
      refreshToken: refreshToken,
      user: userData
    });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse };