const { body } = require('express-validator');

exports.validateDelivery = [
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
  
  body('customerPhone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  
  body('customerEmail')
    .optional()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('address.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required')
    .matches(/^[0-9]{5}$/).withMessage('Please provide a valid 5-digit zip code'),
  
  body('packageInfo.description')
    .trim()
    .notEmpty().withMessage('Package description is required'),
  
  body('packageInfo.weight')
    .isFloat({ min: 0.1 }).withMessage('Package weight must be greater than 0'),
  
  body('scheduledDate')
    .isISO8601().withMessage('Please provide a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Scheduled date cannot be in the past');
      }
      return true;
    })
];
