import { db } from "../lib/db.js";

export const getRoutines = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const offset = (page - 1) * limit;
    const {
      goal,
      type,
      level,
      duration,
      days_per_week,
      time,
      equipment,
      gender,
      category,
      search,
    } = req.query;

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
          routine: {
            is: {
              routine_title: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          routine: {
            is: {
              routine_description: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Main_Goal: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Workout_Type: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Training_Level: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Program_Duration: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Days_Per_Week: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Equipment_Required: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          routine: {
            is: {
              workout_summary: {
                is: {
                  Target_Gender: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          category: {
            hasSome: [search],
          },
        },
      ];
    }

    if (goal) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Main_Goal: goal,
            },
          },
        },
      };
    }

    if (type) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Workout_Type: type,
            },
          },
        },
      };
    }

    if (level) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Training_Level: level,
            },
          },
        },
      };
    }

    if (duration) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Program_Duration: duration,
            },
          },
        },
      };
    }

    if (days_per_week) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Days_Per_Week: days_per_week,
            },
          },
        },
      };
    }

    if (time) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Time_Per_Workout: time,
            },
          },
        },
      };
    }

    if (equipment) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Equipment_Required: equipment,
            },
          },
        },
      };
    }

    if (gender) {
      filter.routine = {
        ...filter.routine,
        is: {
          ...filter.routine?.is,
          workout_summary: {
            is: {
              ...filter.routine?.is?.workout_summary?.is,
              Target_Gender: gender,
            },
          },
        },
      };
    }

    if (category) {
      filter.category = {
        has: category,
      };
    }

    const findOptions = {
      where: filter,
      skip: offset,
    };

    if (Number.isInteger(limit) && limit > 0) {
      findOptions.take = limit;
    }

    const [totalRoutines, filteredRoutines] = await db.$transaction([
      db.routines.count({
        where: filter,
      }),
      db.routines.findMany(findOptions),
    ]);

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
    console.error("Error fetching routines:", error.message, {
      query: req.query,
      stack: error.stack,
    });
    res.status(500).send({
      message: "Failed to fetch routines. Please try again later.",
    });
  }
};

export const getRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "RoutineId not provided." });
    }

    const filteredRoutine = await db.routines.findFirst({
      where: { id_: parseInt(id) },
    });

    if (!filteredRoutine) {
      return res.status(404).send({ message: "Routine not found." });
    }

    return res.status(200).send({
      data: filteredRoutine,
    });
  } catch (error) {
    console.error("Error fetching routine:", error.message, {
      routineId: req.params.id,
      stack: error.stack,
    });
    return res.status(500).send({
      message: `Unable to get the routine with id: ${req.params.id}. Please try again later.`,
    });
  }
};

export const getFilteredRoutines = async (req, res) => {
  try {
    const filter = req.query.filter;

    if (!filter) {
      return res.status(400).send({
        message: "Filter parameter is required.",
      });
    }

    const validFilters = [
      "category",
      "days_per_week",
      "duration",
      "equipment",
      "gender",
      "level",
      "main_goal",
      "workout_type",
    ];

    if (!validFilters.includes(filter)) {
      return res.status(400).send({
        message: `Invalid filter. Valid filters are: ${validFilters.join(", ")}`,
      });
    }

    const selectObject = {};
    selectObject[filter] = true;

    const filteredRoutines = await db.routinesFilter.findMany({
      select: selectObject,
    });

    const filterData = filteredRoutines.map((item) => item[filter]).flat();

    return res.status(200).send({
      totalRoutinesFilter: filterData.length,
      count: filterData.length,
      data: {
        [filter]: filterData,
      },
    });
  } catch (error) {
    console.error("Error fetching routine categories:", error.message, {
      stack: error.stack,
    });
    return res.status(500).send({
      message: "Unable to get routine categories. Please try again later.",
    });
  }
};
