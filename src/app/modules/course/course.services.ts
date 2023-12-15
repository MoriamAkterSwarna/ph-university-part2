import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { CourseSearchableFields } from './course.constant';
import { TCourse, TCourseFaculty } from './course.interface';
import { Course, courseFaculty } from './course.model';

const createCourseIntoDB = async (payload: TCourse) => {
  try {
    const result = await Course.create(payload);
    return result;
  } catch (error) {
    // next(error);
  }
};

const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  try {
    const courseQuery = new QueryBuilder(
      Course.find().populate('preRequisiteCourses.course'),
      query,
    )
      .search(CourseSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();
    // const result = await Course.find();
    const result = await courseQuery.modelQuery;
    return result;
  } catch (error) {
    // next(error);
  }
};

const getSingleCourseFromDB = async (id: string) => {
  try {
    const result = await Course.findById(id).populate(
      'preRequisiteCourses.course',
    );
    return result;
  } catch (error) {
    // next(error);
  }
};

const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const { preRequisiteCourses, ...courseRemainingData } = payload;

  const session = await Course.startSession();
  try {
    session.startTransaction();

    //step 1: basic course info update

    const updatedBasicCourseInfo = await Course.findByIdAndUpdate(
      id,
      courseRemainingData,
      { new: true, runValidators: true, session: session },
    );
    if (!updatedBasicCourseInfo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
    }

    //check if there is any preRequisiteCourses to update
    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      // filter out the deleted fields

      const deletedPreRequisiteCourses = preRequisiteCourses
        .filter(elm => elm.course && elm.isDeleted)
        .map(el => el.course);
      // console.log(deletedPreRequisiteCourses);

      const deletedCourses = await Course.findByIdAndUpdate(
        id,
        {
          $pull: {
            preRequisiteCourses: {
              course: { $in: deletedPreRequisiteCourses },
            },
          },
        },
        { new: true, runValidators: true, session: session },
      );
      if (!deletedCourses) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to delete pre requisite course',
        );
      }

      //filter out the new course fields
      const newPreRequisiteCourses = preRequisiteCourses?.filter(
        elm => elm.course && !elm.isDeleted,
      );
      console.log({ newPreRequisiteCourses });

      const newCourses = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            preRequisiteCourses: { $each: newPreRequisiteCourses },
          },
        },
        { new: true, runValidators: true, session: session },
      );
      if (!newCourses) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to add new pre requisite course',
        );
      }
    }

    const result = await Course.findById(id).populate(
      'preRequisiteCourses.course',
    );

    return { result };
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
  }
};
const deleteCourseFromDB = async (id: string) => {
  try {
    const result = await Course.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    return result;
  } catch (error) {
    // next(error);
  }
};
const assignFacultiesIntoDB = async (
  id: string,
  payload: Partial<TCourseFaculty>,
) => {
  try {
    const result = await courseFaculty.findByIdAndUpdate(
      id,
      { course: id, $addToSet: { faculties: { $each: payload } } },
      { upsert: true, new: true },
    );
    return result;
  } catch (error) {
    // next(error);
  }
};
const removeFacultiesIntoDB = async (
  courseId: string,
  payload: Partial<TCourseFaculty>,
) => {
  try {
    const result = await courseFaculty.findByIdAndUpdate(
      courseId,
      { $pull: { faculties: { $in: payload } } },
      { new: true },
    );
    return result;
  } catch (error) {
    // next(error);
  }
};
export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getSingleCourseFromDB,
  updateCourseIntoDB,
  deleteCourseFromDB,
  assignFacultiesIntoDB,
  removeFacultiesIntoDB,
};
