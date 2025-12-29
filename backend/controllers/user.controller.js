const UserModel = require('../models/user.model');
const { successResponse, errorResponse, notFoundResponse, validationErrorResponse } = require('../utils/response');
const logger = require('../utils/logger');

exports.getMe = async (req, res, next) => {
  try {
    const users = await UserModel.getUsersAddress({ address: req.address });
    if (users.length === 0) {
      const { response, statusCode } = notFoundResponse('User not found');
      return res.status(statusCode).json(response);
    }

    const user = users[0];
    const { response, statusCode } = successResponse({
      id: user.id,
      address: user.address,
      token_balance: user.token_balance,
      MBUSD_balance: user.MBUSD_balance,
      referral_code: user.referral_code,
    });

    return res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

exports.updateMe = async (_req, res) => {
  const { response, statusCode } = errorResponse('Not implemented', 501);
  return res.status(statusCode).json(response);
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await UserModel.getUserSettings({ user_id: req.user_id });
    const { response, statusCode } = successResponse(settings, 'Settings retrieved successfully');
    return res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Get user settings error:', error);
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body || {};

    const allowedKeys = new Set([
      'theme',
      'language',
      'currency',
      'timezone',
      'emailNotifications',
      'pushNotifications',
    ]);

    const unknownKeys = Object.keys(settings).filter((k) => !allowedKeys.has(k));
    if (unknownKeys.length > 0) {
      const { response, statusCode } = validationErrorResponse(`Unknown settings: ${unknownKeys.join(', ')}`);
      return res.status(statusCode).json(response);
    }

    if (typeof settings.theme !== 'undefined' && !['dark', 'light'].includes(settings.theme)) {
      const { response, statusCode } = validationErrorResponse('theme must be one of: dark, light');
      return res.status(statusCode).json(response);
    }

    if (typeof settings.emailNotifications !== 'undefined' && typeof settings.emailNotifications !== 'boolean') {
      const { response, statusCode } = validationErrorResponse('emailNotifications must be a boolean');
      return res.status(statusCode).json(response);
    }

    if (typeof settings.pushNotifications !== 'undefined' && typeof settings.pushNotifications !== 'boolean') {
      const { response, statusCode } = validationErrorResponse('pushNotifications must be a boolean');
      return res.status(statusCode).json(response);
    }

    const updated = await UserModel.updateUserSettings({ user_id: req.user_id, settings });
    const { response, statusCode } = successResponse(updated, 'Settings updated successfully');
    return res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Update user settings error:', error);
    next(error);
  }
};
