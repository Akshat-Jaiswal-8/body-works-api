export const typeDefs = `
    type exercises {
        name : String!
        title : String!
        target : String!
        musclesWorked : String
        bodyPart : String
        equipment : String
        id : ID!
        blog : String
        images : [String]
        gifUrl : String
        videos : [String]
        keywords : [String]
    
    }
    
    type Equipment {
        equipment : String!
        exerciseCount : Int
        numberOfTargetMuscles : Int
    }
    
    type targetMuscle {
        target : String
        exerciseCount : Int
        numberOfTargetMuscles : Int
    }
    
    type Query {
       exercises : [exercises!]!
       exercise(id : ID) : exercises!
       equipment : [Equipment]
       target : [targetMuscle]
       bodyPart : [exercises!]!
    }


    input createExerciseInput {
        name : String!
        title : String!
        target : String!
        musclesWorked : String
        bodyPart : String
        equipment : String
        blog : String
        images : [String]
        gifUrl : String
        videos : [String]
        keywords : [String]
    }
    
    type Mutation {
        createExercise (input : createExerciseInput!) : exercises
        deleteExercise (id : ID) : exercises
    }

`

