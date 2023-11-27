import { z } from 'zod';

const userValidationSchema = z.object({
  password: z
    .string({
      invalid_type_error: 'Password must be string',
    })
    .max(20, { message: 'Password must be less than 20 characters' })
    .optional(),
  //   needPasswordChange: z.boolean().optional().default(true),
  //   role: z.enum(['admin', 'student', 'faculty']),
  //   status: z.enum(['in-progress', 'blocked']).default('in-progress'),
  //   isDeleted: z.boolean().default(false),
});
export const UserValidation = {
  userValidationSchema,
};
