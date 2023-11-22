import Joi from 'joi';
const userNameValidationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .required()
    .pattern(/^[A-Z][a-z]*$/, { name: 'uppercase' })
    .messages({
      'string.base': 'First name must be a string',
      'string.empty': 'First name is required',
      'string.min': 'First name should have a minimum length of 1',
      'string.max': 'First name should have a maximum length of 20',
      'string.pattern.name': 'First name must start with an uppercase letter',
      'string.pattern.base': 'First name must contain only letters',
      'any.required': 'First name is required',
    }),
  middleName: Joi.string(),
  lastName: Joi.string()
    .required()
    .pattern(/^[A-Za-z]+$/, { name: 'letters' })
    .messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name is required',
      'string.pattern.name': 'Last name must contain only letters',
      'any.required': 'Last name is required',
    }),
});

const guardianValidationSchema = Joi.object({
  fatherName: Joi.string().required(),
  fatherOccupation: Joi.string().required(),
  fatherContactNo: Joi.string().required(),
  motherName: Joi.string().required(),
  motherOccupation: Joi.string().required(),
  motherContactNo: Joi.string().required(),
});

const localGuardianValidationSchema = Joi.object({
  name: Joi.string().required(),
  occupation: Joi.string().required(),
  contactNo: Joi.string().required(),
  address: Joi.string().required(),
});

export const studentValidationSchema = Joi.object({
  id: Joi.string().required(),
  name: userNameValidationSchema.required(),
  gender: Joi.string().valid('male', 'female').required(),
  dateOfBirth: Joi.string(),
  email: Joi.string().email().required(),
  contactNo: Joi.string().required(),
  emergencyContactNo: Joi.string().required(),
  bloodGroup: Joi.string().valid(
    'A+',
    'A-',
    'B+',
    'B-',
    'O+',
    'O-',
    'AB+',
    'AB-',
  ),
  presentAddress: Joi.string().required(),
  permanentAddress: Joi.string().required(),
  guardian: guardianValidationSchema.required(),
  localGuardian: localGuardianValidationSchema.required(),
  profileImg: Joi.string(),
  isActive: Joi.string().valid('active', 'blocked').default('active'),
});
