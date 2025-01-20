import routines from "../data/routine-data.json" with { type: "json" };
import routinesFilter from "../data/routine-filter.json" with { type: "json" };
import { url } from "../server.js";

export const getRoutines = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const goal = req.query.goal;
    const type = req.query.type;
    const level = req.query.level;
    const duration = req.query.duration;
    const days_per_week = req.query.days;
    const time = req.query.time;
    const equipment = req.query.equipment;
    const gender = req.query.gender;
    const category = req.query.category;
    const search = req.query.search;

    let filteredRoutines = routines;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filteredRoutines = filteredRoutines.filter(
        (filteredRoutine) =>
          searchRegex.test(filteredRoutine.name) ||
          searchRegex.test(filteredRoutine.routine.routine_title) ||
          searchRegex.test(filteredRoutine.routine.routine_description) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Main Goal"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Workout Type"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Training Level"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Program Duration"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Days Per Week"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Time Per Week"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Equipment Required"],
          ) ||
          searchRegex.test(
            filteredRoutine.routine.workout_summary["Target Gender"],
          ) ||
          filteredRoutine.category.some((eachCategory) =>
            searchRegex.test(eachCategory),
          ),
      );
    }

    if (goal) {
      const goalRegExp = new RegExp(goal, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        goalRegExp.test(routine.routine.workout_summary["Main Goal"]),
      );
    }
    if (type) {
      const typeRegExp = new RegExp(type, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        typeRegExp.test(routine.routine.workout_summary["Workout Type"]),
      );
    }
    if (level) {
      const levelRegExp = new RegExp(level, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        levelRegExp.test(routine.routine.workout_summary["Training Level"]),
      );
    }
    if (duration) {
      const durationRegExp = new RegExp(duration, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        durationRegExp.test(
          routine.routine.workout_summary["Program Duration"],
        ),
      );
    }
    if (days_per_week) {
      const daysRegExp = new RegExp(days_per_week, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        daysRegExp.test(routine.routine.workout_summary["Days Per Week"]),
      );
    }
    if (time) {
      const timeRegExp = new RegExp(time, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        timeRegExp.test(routine.routine.workout_summary["Time Per Workout"]),
      );
    }
    if (equipment) {
      const equipmentRegExp = new RegExp(equipment, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        equipmentRegExp.test(
          routine.routine.workout_summary["Equipment Required"],
        ),
      );
    }
    if (gender) {
      const genderRegExp = new RegExp(gender, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        genderRegExp.test(routine.routine.workout_summary["Target Gender"]),
      );
    }
    if (category) {
      const categoryRegExp = new RegExp(category, "i");
      filteredRoutines = filteredRoutines.filter((routine) =>
        routine.category.some((eachCategory) =>
          categoryRegExp.test(eachCategory),
        ),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalPages = Math.ceil(filteredRoutines.length / limit);
    const paginatedData = filteredRoutines.slice(startIndex, endIndex);

    const finalData = paginatedData.map((routine) => {
      return {
        ...routine,
        routine: {
          ...routine.routine,
          routine_imageUrl: url + "/assets" + routine.routine.routine_imageUrl,
        },
      };
    });

    return res.status(200).send({
      totalRoutines: filteredRoutines.length,
      totalPages,
      finalData,
    });
  } catch (e) {
    res
      .status(500)
      .send({ message: "Failed to fetch routines. Please try again later." });
  }
};

export const getRoutine = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "RoutineId not ." });
    }

    let filteredRoutine = routines.filter(
      (routine) => routine.id === parseInt(id),
    )[0];

    if (filteredRoutine.length === 0) {
      return res.status(400).send({ message: "Routine not found." });
    }

    let finalRoutine = {
      ...filteredRoutine,
      routine: {
        ...filteredRoutine.routine,
        routine_imageUrl:
          url + "/assets" + filteredRoutine.routine.routine_imageUrl,
      },
    };

    return res.status(200).send({
      ...finalRoutine,
    });
  } catch (e) {
    return res.status(500).send({
      message: `Unable to get the routine with id: ${req.params.id}. Please try again later.`,
    });
  }
};

export const getRoutineFilter = (req, res) => {
  try {
    if (!routinesFilter?.category) {
      return res.status(500).send({ message: "No categories found." });
    }

    const finalRoutineFilter = routinesFilter?.category?.map((eachRoutine) => {
      return {
        ...eachRoutine,
        imageUrl: url + "/assets" + eachRoutine.imageUrl,
      };
    });

    return res.status(200).send({
      totalRoutinesFilter: finalRoutineFilter.length,
      data: finalRoutineFilter,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to get routine categories. Please try again later.",
    });
  }
};
