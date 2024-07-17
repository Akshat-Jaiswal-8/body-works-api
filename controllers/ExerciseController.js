import exerciseData from "../data/exercise-data.json" assert { type: "json" };

export const getExercises = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const equipment = req.query.equipment;
    const targetMuscle = req.query.target;
    const bodyPart = req.query.bodyPart;
    const search = req.query.search;

    const url = `${req.get("host")}`;

    let filteredExercises = exerciseData;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filteredExercises = filteredExercises.filter(
        (exercise) =>
          searchRegex.test(exercise.name) ||
          searchRegex.test(exercise.title) ||
          searchRegex.test(exercise.target) ||
          searchRegex.test(exercise["muscle worked"]) ||
          searchRegex.test(exercise.bodyPart) ||
          searchRegex.test(exercise.equipment) ||
          searchRegex.test(exercise.blog) ||
          exercise.keywords.some((keyword) =>
            searchRegex.test(keyword.toLowerCase()),
          ),
      );
    }
    if (equipment) {
      const equipmentRegex = new RegExp(equipment, "i");
      filteredExercises = filteredExercises.filter((exercise) =>
        equipmentRegex.test(exercise.equipment),
      );
    }

    if (targetMuscle) {
      const targetRegex = new RegExp(targetMuscle, "i");
      filteredExercises = filteredExercises.filter((exercise) =>
        targetRegex.test(exercise.target),
      );
    }

    if (bodyPart) {
      const bodyPartRegex = new RegExp(bodyPart, "i");
      filteredExercises = filteredExercises.filter((exercise) =>
        bodyPartRegex.test(exercise.bodyPart),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalPages = Math.ceil(filteredExercises.length / limit);
    const paginatedData = filteredExercises.slice(startIndex, endIndex);
    const finalData = paginatedData.map((finalExercise) => {
      return {
        ...finalExercise,
        images: finalExercise.images.map((image) => url + image),
        gifUrl: url + finalExercise.gifUrl,
      };
    });
    res.send({
      page,
      limit,
      totalExercises: filteredExercises.length,
      totalPages,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
};

export const getExercise = (req, res) => {
  try {
    const { id } = req.params;
    const url = `${req.get("host")}`;

    if (!id) {
      return res.status(400).send({ message: "ExerciseID not found" });
    }

    let filteredExercise = exerciseData.filter(
      (exercise) => exercise.id === id,
    )[0];
    if (filteredExercise.length === 0) {
      return res.send({ status: 400, message: "Exercise not found" });
    }

    let finalExercise = {
      ...filteredExercise,
      images: filteredExercise.images.map((image) => url + image),
      gifUrl: url + filteredExercise.gifUrl,
    };

    return res.status(200).send({
      message: "Exercise: " + finalExercise.id,
      data: finalExercise,
    });
  } catch (e) {
    return res.status(500).send({ message: `${e}` });
  }
};
