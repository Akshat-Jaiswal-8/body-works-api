import { and, asc, count, eq, exists, ilike, inArray, isNotNull, or, sql } from 'drizzle-orm';

import { db } from '../drizzle/db.js';
import {
  routineCategories,
  routineCategoryOptions,
  routineEquipmentOptions,
  routineEquipments,
  routineGenderOptions,
  routineLevelOptions,
  routineMainGoalOptions,
  routineWorkoutTypeOptions,
  routines,
} from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

const decodeQueryValue = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  return decodeURIComponent(value);
};

const parseDurationWeeks = (duration: string) => {
  const match = duration.match(/(\d+)\s*weeks?/i);

  if (!match) {
    return null;
  }

  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildRoutinePayload = (routineRow, categories, equipmentNames) => ({
  id: routineRow.id,
  id_: routineRow.externalRoutineId,
  category: categories,
  routine: {
    routine_title: routineRow.title,
    routine_description: routineRow.description,
    routine_imageUrl: routineRow.imageUrl,
    workout_plan: routineRow.importedWorkoutPlan || [],
    workout_summary: {
      Main_Goal: routineRow.mainGoalName || '',
      Workout_Type: routineRow.workoutTypeName || '',
      Training_Level: routineRow.levelName || '',
      Program_Duration:
        routineRow.durationWeeks === null || routineRow.durationWeeks === undefined
          ? ''
          : `${routineRow.durationWeeks} weeks`,
      Days_Per_Week:
        routineRow.daysPerWeek === null || routineRow.daysPerWeek === undefined
          ? ''
          : String(routineRow.daysPerWeek),
      Time_Per_Workout: routineRow.timePerWorkout,
      Equipment_Required: equipmentNames.join(', '),
      Target_Gender: routineRow.genderName || '',
    },
  },
});

const fetchRoutineCategories = async (routineIds: string[]) => {
  if (routineIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      routineId: routineCategories.routineId,
      categoryName: routineCategoryOptions.name,
    })
    .from(routineCategories)
    .innerJoin(routineCategoryOptions, eq(routineCategories.categoryId, routineCategoryOptions.id))
    .where(inArray(routineCategories.routineId, routineIds))
    .orderBy(asc(routineCategoryOptions.name));

  const categoriesByRoutine = new Map<string, string[]>();

  for (const row of rows) {
    const current = categoriesByRoutine.get(row.routineId) || [];
    current.push(row.categoryName);
    categoriesByRoutine.set(row.routineId, current);
  }

  return categoriesByRoutine;
};

const fetchRoutineEquipmentNames = async (routineIds: string[]) => {
  if (routineIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      routineId: routineEquipments.routineId,
      equipmentName: routineEquipmentOptions.name,
    })
    .from(routineEquipments)
    .innerJoin(
      routineEquipmentOptions,
      eq(routineEquipments.equipmentId, routineEquipmentOptions.id),
    )
    .where(inArray(routineEquipments.routineId, routineIds))
    .orderBy(asc(routineEquipmentOptions.name));

  const equipmentByRoutine = new Map<string, string[]>();

  for (const row of rows) {
    const current = equipmentByRoutine.get(row.routineId) || [];
    current.push(row.equipmentName);
    equipmentByRoutine.set(row.routineId, current);
  }

  return equipmentByRoutine;
};

export const getRoutines = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const offset = (page - 1) * limit;
    const goal = decodeQueryValue(req.query?.goal);
    const type = decodeQueryValue(req.query?.type);
    const level = decodeQueryValue(req.query?.level);
    const duration = decodeQueryValue(req.query?.duration);
    const daysPerWeek = decodeQueryValue(req.query?.days_per_week);
    const time = decodeQueryValue(req.query?.time);
    const equipment = decodeQueryValue(req.query?.equipment);
    const gender = decodeQueryValue(req.query?.gender);
    const category = decodeQueryValue(req.query?.category);
    const search = decodeQueryValue(req.query?.search);

    if (offset < 0) {
      return res.status(400).send({
        message: 'Offset must be a non-negative integer.',
      });
    }

    if (limit && (!Number.isInteger(limit) || limit <= 0)) {
      return res.status(400).send({
        message: 'Limit must be a positive integer.',
      });
    }

    const whereConditions = [];

    if (goal) {
      whereConditions.push(eq(routineMainGoalOptions.name, goal));
    }

    if (type) {
      whereConditions.push(eq(routineWorkoutTypeOptions.name, type));
    }

    if (level) {
      whereConditions.push(eq(routineLevelOptions.name, level));
    }

    if (gender) {
      whereConditions.push(eq(routineGenderOptions.name, gender));
    }

    if (time) {
      whereConditions.push(eq(routines.timePerWorkout, time));
    }

    if (daysPerWeek) {
      const parsedDaysPerWeek = parseInt(daysPerWeek, 10);

      if (!Number.isNaN(parsedDaysPerWeek)) {
        whereConditions.push(eq(routines.daysPerWeek, parsedDaysPerWeek));
      } else {
        whereConditions.push(sql`CAST(${routines.daysPerWeek} AS text) = ${daysPerWeek}`);
      }
    }

    if (duration) {
      const parsedDuration = parseDurationWeeks(duration);

      if (parsedDuration !== null) {
        whereConditions.push(eq(routines.durationWeeks, parsedDuration));
      } else {
        whereConditions.push(sql`${routines.durationWeeks}::text || ' weeks' = ${duration}`);
      }
    }

    if (category) {
      whereConditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(routineCategories)
            .innerJoin(
              routineCategoryOptions,
              eq(routineCategories.categoryId, routineCategoryOptions.id),
            )
            .where(
              and(
                eq(routineCategories.routineId, routines.id),
                eq(routineCategoryOptions.name, category),
              ),
            ),
        ),
      );
    }

    if (equipment) {
      whereConditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(routineEquipments)
            .innerJoin(
              routineEquipmentOptions,
              eq(routineEquipments.equipmentId, routineEquipmentOptions.id),
            )
            .where(
              and(
                eq(routineEquipments.routineId, routines.id),
                eq(routineEquipmentOptions.name, equipment),
              ),
            ),
        ),
      );
    }

    const searchPattern = search ? `%${search}%` : undefined;

    if (searchPattern) {
      whereConditions.push(
        or(
          ilike(routines.title, searchPattern),
          ilike(routines.description, searchPattern),
          ilike(routineMainGoalOptions.name, searchPattern),
          ilike(routineWorkoutTypeOptions.name, searchPattern),
          ilike(routineLevelOptions.name, searchPattern),
          ilike(routineGenderOptions.name, searchPattern),
          ilike(routines.timePerWorkout, searchPattern),
          sql`CAST(${routines.daysPerWeek} AS text) ILIKE ${searchPattern}`,
          sql`${routines.durationWeeks}::text || ' weeks' ILIKE ${searchPattern}`,
          exists(
            db
              .select({ one: sql`1` })
              .from(routineCategories)
              .innerJoin(
                routineCategoryOptions,
                eq(routineCategories.categoryId, routineCategoryOptions.id),
              )
              .where(
                and(
                  eq(routineCategories.routineId, routines.id),
                  ilike(routineCategoryOptions.name, searchPattern),
                ),
              ),
          ),
          exists(
            db
              .select({ one: sql`1` })
              .from(routineEquipments)
              .innerJoin(
                routineEquipmentOptions,
                eq(routineEquipments.equipmentId, routineEquipmentOptions.id),
              )
              .where(
                and(
                  eq(routineEquipments.routineId, routines.id),
                  ilike(routineEquipmentOptions.name, searchPattern),
                ),
              ),
          ),
        ),
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [countResult, routineRows] = await Promise.all([
      db
        .select({
          count: count(),
        })
        .from(routines)
        .leftJoin(routineGenderOptions, eq(routines.genderId, routineGenderOptions.id))
        .leftJoin(routineLevelOptions, eq(routines.levelId, routineLevelOptions.id))
        .leftJoin(routineMainGoalOptions, eq(routines.mainGoalId, routineMainGoalOptions.id))
        .leftJoin(
          routineWorkoutTypeOptions,
          eq(routines.workoutTypeId, routineWorkoutTypeOptions.id),
        )
        .where(whereClause),
      db
        .select({
          id: routines.id,
          externalRoutineId: routines.externalRoutineId,
          title: routines.title,
          description: routines.description,
          imageUrl: routines.imageUrl,
          importedWorkoutPlan: routines.importedWorkoutPlan,
          daysPerWeek: routines.daysPerWeek,
          durationWeeks: routines.durationWeeks,
          timePerWorkout: routines.timePerWorkout,
          genderName: routineGenderOptions.name,
          levelName: routineLevelOptions.name,
          mainGoalName: routineMainGoalOptions.name,
          workoutTypeName: routineWorkoutTypeOptions.name,
        })
        .from(routines)
        .leftJoin(routineGenderOptions, eq(routines.genderId, routineGenderOptions.id))
        .leftJoin(routineLevelOptions, eq(routines.levelId, routineLevelOptions.id))
        .leftJoin(routineMainGoalOptions, eq(routines.mainGoalId, routineMainGoalOptions.id))
        .leftJoin(
          routineWorkoutTypeOptions,
          eq(routines.workoutTypeId, routineWorkoutTypeOptions.id),
        )
        .where(whereClause)
        .orderBy(asc(routines.externalRoutineId), asc(routines.id))
        .limit(limit)
        .offset(offset),
    ]);

    const routineIds = routineRows.map((routine) => routine.id);
    const [categoriesByRoutine, equipmentByRoutine] = await Promise.all([
      fetchRoutineCategories(routineIds),
      fetchRoutineEquipmentNames(routineIds),
    ]);

    const filteredRoutines = routineRows.map((routineRow) => {
      const categories = categoriesByRoutine.get(routineRow.id) || [];
      const equipmentNames = equipmentByRoutine.get(routineRow.id) || [];
      return buildRoutinePayload(routineRow, categories, equipmentNames);
    });

    const totalRoutines = Number(countResult[0]?.count || 0);

    const totalPages = Math.ceil(totalRoutines / limit);

    return res.status(200).send({
      totalRoutines,
      totalPages,
      count: filteredRoutines.length,
      offset: offset,
      limit: limit || null,
      data: filteredRoutines,
    });
  } catch (error) {
    logControllerError(res, 'routines.list.failed', error, {
      query: req.query,
    });
    res.status(500).send({
      message: 'Failed to fetch routines. Please try again later.',
    });
  }
};

export const getRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'RoutineId not provided.' });
    }

    const routineExternalId = parseInt(id, 10);

    if (Number.isNaN(routineExternalId)) {
      return res.status(400).send({ message: 'Invalid RoutineId format.' });
    }

    const [routineRow] = await db
      .select({
        id: routines.id,
        externalRoutineId: routines.externalRoutineId,
        title: routines.title,
        description: routines.description,
        imageUrl: routines.imageUrl,
        importedWorkoutPlan: routines.importedWorkoutPlan,
        daysPerWeek: routines.daysPerWeek,
        durationWeeks: routines.durationWeeks,
        timePerWorkout: routines.timePerWorkout,
        genderName: routineGenderOptions.name,
        levelName: routineLevelOptions.name,
        mainGoalName: routineMainGoalOptions.name,
        workoutTypeName: routineWorkoutTypeOptions.name,
      })
      .from(routines)
      .leftJoin(routineGenderOptions, eq(routines.genderId, routineGenderOptions.id))
      .leftJoin(routineLevelOptions, eq(routines.levelId, routineLevelOptions.id))
      .leftJoin(routineMainGoalOptions, eq(routines.mainGoalId, routineMainGoalOptions.id))
      .leftJoin(routineWorkoutTypeOptions, eq(routines.workoutTypeId, routineWorkoutTypeOptions.id))
      .where(eq(routines.externalRoutineId, routineExternalId))
      .limit(1);

    if (!routineRow) {
      return res.status(404).send({ message: 'Routine not found.' });
    }

    const [categoriesByRoutine, equipmentByRoutine] = await Promise.all([
      fetchRoutineCategories([routineRow.id]),
      fetchRoutineEquipmentNames([routineRow.id]),
    ]);

    const payload = buildRoutinePayload(
      routineRow,
      categoriesByRoutine.get(routineRow.id) || [],
      equipmentByRoutine.get(routineRow.id) || [],
    );

    return res.status(200).send({
      data: payload,
    });
  } catch (error) {
    logControllerError(res, 'routines.get.failed', error, {
      routineId: req.params.id,
    });
    return res.status(500).send({
      message: `Unable to get the routine with id: ${req.params.id}. Please try again later.`,
    });
  }
};

export const getFilteredRoutines = async (req, res) => {
  try {
    const filter = decodeQueryValue(req.query.filter);

    if (!filter) {
      return res.status(400).send({
        message: 'Filter parameter is required.',
      });
    }

    const validFilters = [
      'category',
      'days_per_week',
      'duration',
      'equipment',
      'gender',
      'level',
      'main_goal',
      'workout_type',
    ];

    if (!validFilters.includes(filter)) {
      return res.status(400).send({
        message: `Invalid filter. Valid filters are: ${validFilters.join(', ')}`,
      });
    }

    let filterData = [];

    if (filter === 'category') {
      const rows = await db
        .select({
          imageUrl: routineCategoryOptions.imageUrl,
          nRoutines: routineCategoryOptions.routinesCount,
          title: routineCategoryOptions.name,
        })
        .from(routineCategoryOptions)
        .orderBy(asc(routineCategoryOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'equipment') {
      const rows = await db
        .select({
          imageUrl: routineEquipmentOptions.imageUrl,
          nRoutines: routineEquipmentOptions.routinesCount,
          title: routineEquipmentOptions.name,
        })
        .from(routineEquipmentOptions)
        .orderBy(asc(routineEquipmentOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'gender') {
      const rows = await db
        .select({
          imageUrl: routineGenderOptions.imageUrl,
          nRoutines: routineGenderOptions.routinesCount,
          title: routineGenderOptions.name,
        })
        .from(routineGenderOptions)
        .orderBy(asc(routineGenderOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'level') {
      const rows = await db
        .select({
          imageUrl: routineLevelOptions.imageUrl,
          nRoutines: routineLevelOptions.routinesCount,
          title: routineLevelOptions.name,
        })
        .from(routineLevelOptions)
        .orderBy(asc(routineLevelOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'main_goal') {
      const rows = await db
        .select({
          imageUrl: routineMainGoalOptions.imageUrl,
          nRoutines: routineMainGoalOptions.routinesCount,
          title: routineMainGoalOptions.name,
        })
        .from(routineMainGoalOptions)
        .orderBy(asc(routineMainGoalOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'workout_type') {
      const rows = await db
        .select({
          imageUrl: routineWorkoutTypeOptions.imageUrl,
          nRoutines: routineWorkoutTypeOptions.routinesCount,
          title: routineWorkoutTypeOptions.name,
        })
        .from(routineWorkoutTypeOptions)
        .orderBy(asc(routineWorkoutTypeOptions.name));

      filterData = rows.map((row) => ({
        imageUrl: row.imageUrl,
        nRoutines: Number(row.nRoutines || 0),
        title: row.title,
      }));
    }

    if (filter === 'days_per_week') {
      const rows = await db
        .select({
          title: sql<string>`CAST(${routines.daysPerWeek} AS text)`,
          nRoutines: count(),
        })
        .from(routines)
        .where(isNotNull(routines.daysPerWeek))
        .groupBy(routines.daysPerWeek)
        .orderBy(asc(routines.daysPerWeek));

      filterData = rows.map((row) => ({
        title: row.title,
        nRoutines: Number(row.nRoutines || 0),
      }));
    }

    if (filter === 'duration') {
      const rows = await db
        .select({
          title: sql<string>`${routines.durationWeeks}::text || ' weeks'`,
          nRoutines: count(),
        })
        .from(routines)
        .where(isNotNull(routines.durationWeeks))
        .groupBy(routines.durationWeeks)
        .orderBy(asc(routines.durationWeeks));

      filterData = rows.map((row) => ({
        title: row.title,
        nRoutines: Number(row.nRoutines || 0),
      }));
    }

    return res.status(200).send({
      totalRoutinesFilter: filterData.length,
      count: filterData.length,
      data: {
        [filter]: filterData,
      },
    });
  } catch (error) {
    logControllerError(res, 'routines.filters.failed', error);
    return res.status(500).send({
      message: 'Unable to get routine categories. Please try again later.',
    });
  }
};
