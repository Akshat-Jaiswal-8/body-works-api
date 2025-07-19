import { db } from "../lib/db.js";

export const getExercises = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const offset = (page - 1) * limit;
    const equipment = req.query?.equipment
      ? decodeURIComponent(req.query.equipment)
      : undefined;
    const targetMuscle = req.query?.target
      ? decodeURIComponent(req.query.target)
      : undefined;
    const bodyPart = req.query?.bodyPart
      ? decodeURIComponent(req.query.bodyPart)
      : undefined;
    const search = req.query?.search
      ? decodeURIComponent(req.query.search)
      : undefined;

    if (offset < 0) {
      return res.status(400).send({
        message: "Offset must be a non-negative integer.",
      });
    }

    if (limit && (!Number.isInteger(limit) || limit <= 0)) {
      return res.status(400).send({
        message: "Limit must be a positive integer.",
      });
    }

    const filter = {};

    if (search) {
      filter.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          target: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          muscle_worked: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          bodyPart: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          equipment: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          blog: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          keywords: {
            hasSome: [search],
          },
        },
      ];
    }

    if (equipment) {
      filter.equipment = {
        contains: equipment,
        mode: "insensitive",
      };
    }

    if (targetMuscle) {
      filter.target = {
        contains: targetMuscle,
        mode: "insensitive",
      };
    }

    if (bodyPart) {
      filter.bodyPart = {
        contains: bodyPart,
        mode: "insensitive",
      };
    }

    const findOptions = {
      where: filter,
      skip: offset,
    };

    if (Number.isInteger(limit) && limit > 0) {
      findOptions.take = limit;
    }

    const [totalExercises, exercises] = await db.$transaction([
      db.exercises.count({
        where: filter,
      }),
      db.exercises.findMany(findOptions),
    ]);

    const totalPages = Math.ceil(totalExercises / limit);

    return res.status(200).send({
      totalExercises: totalExercises,
      totalPages,
      count: exercises.length,
      page: page,
      limit: limit || null,
      data: exercises,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error.message, {
      query: req.query,
      stack: error.stack,
    });
    res.status(500).send({
      message: "Failed to fetch exercises. Please try again later.",
    });
  }
};

export const getExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "ExerciseId not found." });
    }

    const paddedId = id.padStart(4, "0");

    const filteredExercise = await db.exercises.findFirst({
      where: { id_: paddedId },
    });

    if (!filteredExercise) {
      return res.status(404).send({ message: "Exercise not found." });
    }

    return res.status(200).send({
      data: filteredExercise,
    });
  } catch (error) {
    console.error("Error fetching exercise:", error.message, {
      exerciseId: req.params.id,
      stack: error.stack,
    });
    return res.status(500).send({
      message: "Failed to fetch the exercise. Please try again later.",
    });
  }
};
