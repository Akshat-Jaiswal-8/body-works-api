import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/* ----------------------------- */
/* Exercise catalog              */
/* ----------------------------- */

const createExerciseMetaStructure = () => ({
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  imageUrl: text('image_url').notNull(),
  exerciseCount: integer('exercise_count').notNull().default(0),
});

export const bodyParts = pgTable(
  'body_parts',
  {
    ...createExerciseMetaStructure(),
  },
  (table) => [
    uniqueIndex('body_parts_name_unique').on(table.name),
    uniqueIndex('body_parts_slug_unique').on(table.slug),
  ],
);

export const equipments = pgTable(
  'equipments',
  {
    ...createExerciseMetaStructure(),
  },
  (table) => [
    uniqueIndex('equipments_name_unique').on(table.name),
    uniqueIndex('equipments_slug_unique').on(table.slug),
  ],
);

export const targetMuscles = pgTable(
  'target_muscles',
  {
    ...createExerciseMetaStructure(),
  },
  (table) => [
    uniqueIndex('target_muscles_name_unique').on(table.name),
    uniqueIndex('target_muscles_slug_unique').on(table.slug),
  ],
);

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    exerciseId: integer('exercise_id').notNull().unique(),

    name: text('name').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),

    blog: text('blog'),
    gifUrl: text('gif_url'),
    musclesWorked: text('muscles_worked'),

    bodyPartId: uuid('body_part_id')
      .notNull()
      .references(() => bodyParts.id),
    equipmentId: uuid('equipment_id')
      .notNull()
      .references(() => equipments.id),
    targetMuscleId: uuid('target_muscle_id')
      .notNull()
      .references(() => targetMuscles.id),

    images: text('images').array().notNull().default([]),
    videos: text('videos').array().notNull().default([]),
    keywords: text('keywords').array().notNull().default([]),
  },
  (table) => [
    uniqueIndex('exercises_slug_unique').on(table.slug),
    index('exercises_name_idx').on(table.name),
    index('exercises_body_part_idx').on(table.bodyPartId),
    index('exercises_equipment_idx').on(table.equipmentId),
    index('exercises_target_muscle_idx').on(table.targetMuscleId),
  ],
);

/* ----------------------------- */
/* Routine filter lookup tables  */
/* ----------------------------- */

const createRoutineLookupWithImage = () => ({
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  imageUrl: text('image_url').notNull(),
  routinesCount: integer('routines_count').notNull().default(0),
});

export const routineCategoryOptions = pgTable(
  'routine_category_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_category_options_name_unique').on(table.name),
    uniqueIndex('routine_category_options_slug_unique').on(table.slug),
  ],
);

export const routineEquipmentOptions = pgTable(
  'routine_equipment_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_equipment_options_name_unique').on(table.name),
    uniqueIndex('routine_equipment_options_slug_unique').on(table.slug),
  ],
);

export const routineGenderOptions = pgTable(
  'routine_gender_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_gender_options_name_unique').on(table.name),
    uniqueIndex('routine_gender_options_slug_unique').on(table.slug),
  ],
);

export const routineLevelOptions = pgTable(
  'routine_level_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_level_options_name_unique').on(table.name),
    uniqueIndex('routine_level_options_slug_unique').on(table.slug),
  ],
);

export const routineMainGoalOptions = pgTable(
  'routine_main_goal_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_main_goal_options_name_unique').on(table.name),
    uniqueIndex('routine_main_goal_options_slug_unique').on(table.slug),
  ],
);

export const routineWorkoutTypeOptions = pgTable(
  'routine_workout_type_options',
  {
    ...createRoutineLookupWithImage(),
  },
  (table) => [
    uniqueIndex('routine_workout_type_options_name_unique').on(table.name),
    uniqueIndex('routine_workout_type_options_slug_unique').on(table.slug),
  ],
);

/* ----------------------------- */
/* Routines                      */
/* ----------------------------- */

export type WorkoutPlanItem = {
  heading: string;
  day_plan: string;
};

export const routines = pgTable(
  'routines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    externalRoutineId: integer('external_routine_id').unique(), // nullable for custom routines

    source: text('source').notNull().default('imported'), // imported | custom

    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),

    genderId: uuid('gender_id').references(() => routineGenderOptions.id),
    levelId: uuid('level_id').references(() => routineLevelOptions.id),
    mainGoalId: uuid('main_goal_id').references(() => routineMainGoalOptions.id),
    workoutTypeId: uuid('workout_type_id').references(() => routineWorkoutTypeOptions.id),

    daysPerWeek: integer('days_per_week'),
    durationWeeks: integer('duration_weeks'),
    timePerWorkout: text('time_per_workout'),

    importedWorkoutPlan: jsonb('imported_workout_plan').$type<WorkoutPlanItem[]>(),

    notes: text('notes'),
  },
  (table) => [
    uniqueIndex('routines_slug_unique').on(table.slug),
    index('routines_source_idx').on(table.source),
    index('routines_gender_idx').on(table.genderId),
    index('routines_level_idx').on(table.levelId),
    index('routines_main_goal_idx').on(table.mainGoalId),
    index('routines_workout_type_idx').on(table.workoutTypeId),
    index('routines_days_per_week_idx').on(table.daysPerWeek),
    index('routines_duration_weeks_idx').on(table.durationWeeks),
  ],
);

/* ----------------------------- */
/* Many-to-many routine filters  */
/* ----------------------------- */

export const routineCategories = pgTable(
  'routine_categories',
  {
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => routineCategoryOptions.id),
  },
  (table) => [
    primaryKey({ columns: [table.routineId, table.categoryId] }),
    index('routine_categories_routine_idx').on(table.routineId),
    index('routine_categories_category_idx').on(table.categoryId),
  ],
);

export const routineEquipments = pgTable(
  'routine_equipments',
  {
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id),
    equipmentId: uuid('equipment_id')
      .notNull()
      .references(() => routineEquipmentOptions.id),
  },
  (table) => [
    primaryKey({ columns: [table.routineId, table.equipmentId] }),
    index('routine_equipments_routine_idx').on(table.routineId),
    index('routine_equipments_equipment_idx').on(table.equipmentId),
  ],
);

/* ----------------------------- */
/* Custom routine builder        */
/* ----------------------------- */

export const routineDays = pgTable(
  'routine_days',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id),

    dayNumber: integer('day_number').notNull(),
    heading: text('heading'),
    notes: text('notes'),
  },
  (table) => [
    index('routine_days_routine_idx').on(table.routineId),
    uniqueIndex('routine_days_unique_per_routine').on(table.routineId, table.dayNumber),
  ],
);

export const routineDayExercises = pgTable(
  'routine_day_exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    routineDayId: uuid('routine_day_id')
      .notNull()
      .references(() => routineDays.id),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),

    sortOrder: integer('sort_order').notNull(),
    sets: text('sets'),
    reps: text('reps'),
    duration: text('duration'),
    restSeconds: integer('rest_seconds'),
    notes: text('notes'),
  },
  (table) => [
    index('routine_day_exercises_day_idx').on(table.routineDayId),
    index('routine_day_exercises_exercise_idx').on(table.exerciseId),
    uniqueIndex('routine_day_exercises_unique_order').on(table.routineDayId, table.sortOrder),
  ],
);
