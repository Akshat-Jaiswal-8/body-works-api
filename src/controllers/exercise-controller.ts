import { and, asc, count, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '../drizzle/db.js';
import { bodyParts, equipments, exercises, targetMuscles } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

interface IExerciseRequest extends Request {
  query: {
    limit?: string;
    page?: string;
    equipment?: string;
    target?: string;
    bodyPart?: string;
    search?: string;
  };
  params: {
    id: string;
  };
}

export const getExercises = async (req: IExerciseRequest, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const offset = (page - 1) * limit;
    const equipmentSlug = req.query?.equipment
      ? decodeURIComponent(req.query.equipment)
      : undefined;
    const targetMuscleSlug = req.query?.target ? decodeURIComponent(req.query.target) : undefined;
    const bodyPartSlug = req.query?.bodyPart ? decodeURIComponent(req.query.bodyPart) : undefined;
    const search = req.query?.search ? decodeURIComponent(req.query.search) : undefined;

    if (page <= 0) {
      return res.status(400).send({
        message: 'Page must be a positive integer.',
      });
    }

    if (limit <= 0) {
      return res.status(400).send({
        message: 'Limit must be a positive integer.',
      });
    }

    const whereConditions = [];
    const searchPattern = search ? `%${search}%` : undefined;

    if (searchPattern) {
      whereConditions.push(
        or(
          ilike(exercises.name, searchPattern),
          ilike(exercises.title, searchPattern),
          ilike(exercises.musclesWorked, searchPattern),
          ilike(exercises.blog, searchPattern),
          sql`array_to_string(${exercises.keywords}, ' ') ILIKE ${searchPattern}`,
        ),
      );
    }

    if (equipmentSlug) {
      whereConditions.push(ilike(equipments.name, `%${equipmentSlug}%`));
    }

    if (targetMuscleSlug) {
      whereConditions.push(ilike(targetMuscles.name, `%${targetMuscleSlug}%`));
    }

    if (bodyPartSlug) {
      whereConditions.push(ilike(bodyParts.name, `%${bodyPartSlug}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const rawExercises = await db
      .select({
        id: exercises.id,
        exerciseId: exercises.exerciseId,
        name: exercises.name,
        title: exercises.title,
        blog: exercises.blog,
        gifUrl: exercises.gifUrl,
        musclesWorked: exercises.musclesWorked,
        images: exercises.images,
        videos: exercises.videos,
        keywords: exercises.keywords,
        bodyPart: bodyParts.name,
        equipment: equipments.name,
        target: targetMuscles.name,
      })
      .from(exercises)
      .leftJoin(bodyParts, eq(exercises.bodyPartId, bodyParts.id))
      .leftJoin(equipments, eq(exercises.equipmentId, equipments.id))
      .leftJoin(targetMuscles, eq(exercises.targetMuscleId, targetMuscles.id))
      .where(whereClause)
      .orderBy(asc(exercises.exerciseId))
      .limit(limit)
      .offset(offset);

    let totalExercises = 0;

    if (whereConditions.length > 0) {
      const countResult = await db
        .select({
          count: count(),
        })
        .from(exercises)
        .leftJoin(bodyParts, eq(exercises.bodyPartId, bodyParts.id))
        .leftJoin(equipments, eq(exercises.equipmentId, equipments.id))
        .leftJoin(targetMuscles, eq(exercises.targetMuscleId, targetMuscles.id))
        .where(and(...whereConditions));

      totalExercises = countResult[0]?.count || 0;
    } else {
      const countResult = await db
        .select({
          count: count(),
        })
        .from(exercises)
        .execute();
      totalExercises = countResult[0]?.count || 0;
    }

    const totalPages = Math.ceil(totalExercises / limit);

    const exercisesWithRelations = rawExercises.map((ex) => ({
      id: ex.id,
      id_: String(ex.exerciseId).padStart(4, '0'),
      name: ex.name,
      title: ex.title,
      blog: ex.blog,
      gifUrl: ex.gifUrl,
      muscles_worked: ex.musclesWorked,
      images: ex.images,
      videos: ex.videos,
      keywords: ex.keywords,
      bodyPart: ex.bodyPart,
      equipment: ex.equipment,
      target: ex.target,
    }));

    return res.status(200).send({
      totalExercises,
      totalPages,
      count: exercisesWithRelations.length,
      page,
      limit,
      data: exercisesWithRelations,
    });
  } catch (error) {
    logControllerError(res, 'exercise.list.failed', error, {
      query: req.query,
    });
    res.status(500).send({
      message: 'Failed to fetch exercises. Please try again later.',
    });
  }
};

export const getExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'ExerciseId not found.' });
    }

    const exerciseId = parseInt(id);
    if (isNaN(exerciseId)) {
      return res.status(400).send({ message: 'Invalid ExerciseId format.' });
    }

    const [rawExercise] = await db
      .select({
        id: exercises.id,
        exerciseId: exercises.exerciseId,
        name: exercises.name,
        title: exercises.title,
        blog: exercises.blog,
        gifUrl: exercises.gifUrl,
        musclesWorked: exercises.musclesWorked,
        images: exercises.images,
        videos: exercises.videos,
        keywords: exercises.keywords,
        bodyPart: bodyParts.name,
        equipment: equipments.name,
        target: targetMuscles.name,
      })
      .from(exercises)
      .leftJoin(bodyParts, eq(exercises.bodyPartId, bodyParts.id))
      .leftJoin(equipments, eq(exercises.equipmentId, equipments.id))
      .leftJoin(targetMuscles, eq(exercises.targetMuscleId, targetMuscles.id))
      .where(eq(exercises.exerciseId, exerciseId))
      .limit(1);

    if (!rawExercise) {
      return res.status(404).send({ message: 'Exercise not found.' });
    }

    const filteredExercise = {
      id: rawExercise.id,
      id_: String(rawExercise.exerciseId).padStart(4, '0'),
      name: rawExercise.name,
      title: rawExercise.title,
      blog: rawExercise.blog,
      gifUrl: rawExercise.gifUrl,
      muscles_worked: rawExercise.musclesWorked,
      images: rawExercise.images,
      videos: rawExercise.videos,
      keywords: rawExercise.keywords,
      bodyPart: rawExercise.bodyPart,
      equipment: rawExercise.equipment,
      target: rawExercise.target,
    };

    return res.status(200).send({
      data: filteredExercise,
    });
  } catch (error) {
    logControllerError(res, 'exercise.get.failed', error, {
      exerciseId: req.params.id,
    });
    return res.status(500).send({
      message: 'Failed to fetch the exercise. Please try again later.',
    });
  }
};
