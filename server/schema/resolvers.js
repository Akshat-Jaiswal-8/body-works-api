import {exerciseList} from "../ex-data.js";
import _ from "lodash"


let lastId = 0;
for (const exercise of exerciseList) {
    if (exercise.id > lastId){
        lastId = exercise.id
    }
}
export const resolvers = {
    Query : {
        exercises : () => {
            return exerciseList;
        },
        exercise : (parent , args ) => {
            const exerciseId = args.id;
            return _.find(exerciseList , {id : (exerciseId)})
        },
        equipment: () => {
            const equipmentCounts = {};
            exerciseList.forEach((exercise) => {
                const equipment = exercise.equipment;
                if (equipment) {
                    if (!equipmentCounts[equipment]) {
                        equipmentCounts[equipment] = 0;
                    }
                    equipmentCounts[equipment]++;
                }
            });
            const numberOfTargetMuscles = Object.keys(equipmentCounts).length;
            return(
                Object.keys(equipmentCounts).map((equipment) => ({
                equipment,
                exerciseCount: equipmentCounts[equipment],
                numberOfTargetMuscles,
            })));

        },
        target: () => {
            const targetMuscleCounts = {};
            exerciseList.forEach((exercise) => {
                const target = exercise.target;
                if (target) {
                    if (!targetMuscleCounts[target]) {
                        targetMuscleCounts[target] = 0;
                    }
                    targetMuscleCounts[target]++;
                }
            });
            const numberOfTargetMuscles = Object.keys(targetMuscleCounts).length;
            return(
                Object.keys(targetMuscleCounts).map((target) => ({
                target,
                exerciseCount: targetMuscleCounts[target],
                numberOfTargetMuscles,
            })));
        },

        bodyPart : () => {
            return _.map(exerciseList , (exercises) => {
                console.log(exercises.bodyPart)
                return exercises.bodyPart;
            })
        }
    },
    Mutation : {
        createExercise : (parent , args) => {
            const exercise = args.input;
            exercise.id =+(lastId) + 1;
            exerciseList.push(exercise);
            return exercise;
        },
        deleteExercise : (parent , args ) => {
            const id = args.id;
            _.remove(exerciseList , (user) => user.id === id)
            return null;
        }
    }
}
