import { z } from 'zod';
import { Days } from './OfferedCourse.constant';

const timeStringSchema = z.string().refine(
  time => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  },
  {
    message: 'Invalid time format, expected "HH: MM"  in 24 hours format',
  },
);

const createOfferedCourseValidationSchema = z.object({
  body: z
    .object({
      semesterRegistration: z.string(),
      academicFaculty: z.string(),
      academicDepartment: z.string(),
      course: z.string(),
      faculty: z.string(),
      section: z.number(),
      maxCapacity: z.number(),
      days: z.array(z.enum([...Days] as [string, ...string[]])),
      // startTime: z.string().refine(
      //   time => {
      //     const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      //     return regex.test(time);
      //   },
      //   {
      //     message: 'Invalid time format, expected "HH: MM"  in 24 hours format',
      //   },
      // ),
      // endTime: z.string().refine(
      //   time => {
      //     const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      //     return regex.test(time);
      //   },
      //   {
      //     message: 'Invalid time format, expected "HH: MM"  in 24 hours format',
      //   },
      // ),
      startTime: timeStringSchema,
      endTime: timeStringSchema,
    })
    .refine(
      body => {
        //start time : 10:30  => 1970-01--1T10:30
        //end time : 11:30  => 1970-01--1T12:30
        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);
        return end > start;
      },
      {
        message: 'End time must be greater than start time',
      },
    ),
});
const updateOfferedCourseValidationSchema = z.object({
  body: z
    .object({
      faculty: z.string(),
      maxCapacity: z.number(),
      days: z.array(z.enum([...Days] as [string, ...string[]])),
      // startTime: z.string().refine(
      //   time => {
      //     const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      //     return regex.test(time);
      //   },
      //   {
      //     message: 'Invalid time format, expected "HH: MM"  in 24 hours format',
      //   },
      // ),
      // endTime: z.string().refine(
      //   time => {
      //     const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      //     return regex.test(time);
      //   },
      //   {
      //     message: 'Invalid time format, expected "HH: MM"  in 24 hours format',
      //   },
      // ),
      startTime: timeStringSchema,
      endTime: timeStringSchema,
    })
    .refine(
      body => {
        //start time : 10:30  => 1970-01--1T10:30
        //end time : 11:30  => 1970-01--1T12:30
        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);
        return end > start;
      },
      {
        message: 'End time must be greater than start time',
      },
    ),
});

export const OfferedCourseValidation = {
  createOfferedCourseValidationSchema,
  updateOfferedCourseValidationSchema,
};
