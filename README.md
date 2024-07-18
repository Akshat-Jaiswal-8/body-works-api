# Body Works API

Welcome to the Body Works API! This API provides comprehensive information on exercises, body parts, target muscles, equipment, and routines. It is designed to help users find and utilize various fitness resources to improve their health and workout regimens.

## Base URL
### https://body-works-api.up.railway.app

## Endpoints :-

### 1. Get Exercises Information

- **Endpoint :** `/exercises`
- **Method :** GET
- **Params :** 
```
page: 1
limit: 10
equipment: eg. 
bodypart: eg. waist
targetMuscle: eg. abs
search: anything related to exercise.
```

- **API will look like this :**
```
https://body-works-api.up.railway.app/exercises?limit=10&page=1&bodyPart=waist&equipment=body%20weight&targetMuscle=abs

```

- **Response type :** 
```
Array of objects containing the following entries:

name: string;
title: string;
target: string;
"muscles worked": string;
bodyPart: string;
equipment: string;
id: string;
blog: string;
images: string[];
gifUrl: string;
videos: string[];
keywords: string[];
```
- **Sample Response:**
```json
{
    "totalExercises": 220,
    "totalPages": 220,
    "data": [
        {
            "name": "3/4 sit-up",
            "title": "3/4 Sit-Up",
            "target": "abs",
            "muscles worked": "- Rectus abdominis (six-pack muscles)\n- Hip flexors\n- Lower back muscles\n",
            "bodyPart": "waist",
            "equipment": "body weight",
            "id": "0001",
            "blog": "# 3/4 Sit-Up\n\n## Description\nThe 3/4 sit-up is an abdominal exercise that targets the rectus abdominis, commonly known as the \"six-pack\" muscles. It also engages the hip flexors and the muscles of the lower back. This exercise aims to strengthen the core muscles and improve overall abdominal stability.\n\n## Instructions\n1. Start by lying on your back on a mat or a flat surface with your knees bent and feet flat on the ground. Keep your feet hip-width apart.\n2. Place your hands lightly behind your head, supporting your neck with your fingertips. Avoid pulling on your neck during the exercise.\n3. Engage your abdominal muscles by drawing your belly button in towards your spine.\n4. Slowly lift your upper body off the ground, curling your shoulders towards your knees. Keep your lower back in contact with the ground throughout the movement.\n5. Stop when your torso is at a 45-degree angle from the ground, or when you feel a strong contraction in your abdominal muscles. This position is often referred to as the \"three-quarter\" point.\n6. Hold this position briefly, then slowly lower your upper body back down to the starting position, maintaining control and engaging your core.\n7. Repeat the movement for the desired number of repetitions.\n\n## Variations\n- Beginner Variation: If you are a beginner or have difficulty performing the full 3/4 sit-up, you can start by lifting your upper body only a few inches off the ground and gradually increase the range of motion as your core strength improves.\n- Advanced Variation: To make the exercise more challenging, you can hold a weight plate or a medicine ball against your chest while performing the 3/4 sit-up.\n\n## Muscles Worked\n- Rectus abdominis (six-pack muscles)\n- Hip flexors\n- Lower back muscles\n\n## Common Mistakes\n- Using momentum: Avoid using momentum to lift your upper body. Focus on controlled movements and use your abdominal muscles to initiate the movement.\n- Neck strain: Do not pull on your neck with your hands during the exercise. Use your fingertips for light support only.\n- Arching the lower back: Keep your lower back in contact with the ground throughout the movement to maintain proper form and prevent strain on the lower back.\n\n## Safety Precautions\n- Consult with a healthcare professional before starting any new exercise program, especially if you have a history of back or neck problems.\n- If you experience any pain or discomfort during the exercise, stop immediately and seek medical advice.\n- Engage your core muscles and maintain proper form throughout the exercise to minimize the risk of injury.\n- If you have difficulty maintaining stability or if you have a weak core, it is recommended to perform this exercise under the supervision of a qualified fitness professional.",
            "images": [
                "body-works-api.up.railway.app/assets/images/0001/1.jpeg",
                "body-works-api.up.railway.app/assets/images/0001/2.jpeg",
                "body-works-api.up.railway.app/assets/images/0001/3.jpeg",
                "body-works-api.up.railway.app/assets/images/0001/4.jpeg",
                "body-works-api.up.railway.app/assets/images/0001/5.jpeg"
            ],
            "gifUrl": "body-works-api.up.railway.app/assets/gifs/0001.gif",
            "videos": [
                "https://www.youtube.com/watch?v=-B9lsTWsJCo",
                "https://www.youtube.com/watch?v=FXalPpHfkZk",
                "https://www.youtube.com/watch?v=nxFgeTpBP6s",
                "https://www.youtube.com/watch?v=A7Y2-G4zOUA",
                "https://www.youtube.com/watch?v=Mm6spB-hms8"
            ],
            "keywords": [
                "3/4 sit-up",
                "Abdominal exercise",
                "Rectus abdominis",
                "Six-pack muscles",
                "Hip flexors",
                "Lower back muscles",
                "Core strength",
                "Abdominal stability",
                "Exercise instructions",
                "Variations",
                "Beginner variation",
                "Advanced variation",
                "Muscles worked",
                "Common mistakes",
                "Safety precautions",
                "Healthcare professional",
                "Back and neck problems",
                "Pain and discomfort",
                "Proper form",
                "Qualified fitness professional"
            ]
        }
    ]
}
```
### 2. Get specific exercise Information

- **Endpoint :** `/exercises/<id>`
- **Description :** `Making a GET request on this link will return an exercise which corresponds to the id.`
- **Method :** GET
- **Params :**
```
id : eg.0001
```
- **API will look like this :**
```
https://body-works-api.up.railway.app/exercises/0001
```
- **Response type :**
```
Response Type
Object containing the following entries:

name: string;
title: string;
target: string;
"muscles worked": string;
bodyPart: string;
equipment: string;
id: string;
blog: string;
images: string[];
gifUrl: string;
videos: string[];
keywords: string[];
```
- **Sample Response:**
```json
{
  "data": {
    "name": "3/4 sit-up",
    "title": "3/4 Sit-Up",
    "target": "abs",
    "muscles worked": "- Rectus abdominis (six-pack muscles)\n- Hip flexors\n- Lower back muscles\n",
    "bodyPart": "waist",
    "equipment": "body weight",
    "id": "0001",
    "blog": "# 3/4 Sit-Up\n\n## Description\nThe 3/4 sit-up is an abdominal exercise that targets the rectus abdominis, commonly known as the \"six-pack\" muscles. It also engages the hip flexors and the muscles of the lower back. This exercise aims to strengthen the core muscles and improve overall abdominal stability.\n\n## Instructions\n1. Start by lying on your back on a mat or a flat surface with your knees bent and feet flat on the ground. Keep your feet hip-width apart.\n2. Place your hands lightly behind your head, supporting your neck with your fingertips. Avoid pulling on your neck during the exercise.\n3. Engage your abdominal muscles by drawing your belly button in towards your spine.\n4. Slowly lift your upper body off the ground, curling your shoulders towards your knees. Keep your lower back in contact with the ground throughout the movement.\n5. Stop when your torso is at a 45-degree angle from the ground, or when you feel a strong contraction in your abdominal muscles. This position is often referred to as the \"three-quarter\" point.\n6. Hold this position briefly, then slowly lower your upper body back down to the starting position, maintaining control and engaging your core.\n7. Repeat the movement for the desired number of repetitions.\n\n## Variations\n- Beginner Variation: If you are a beginner or have difficulty performing the full 3/4 sit-up, you can start by lifting your upper body only a few inches off the ground and gradually increase the range of motion as your core strength improves.\n- Advanced Variation: To make the exercise more challenging, you can hold a weight plate or a medicine ball against your chest while performing the 3/4 sit-up.\n\n## Muscles Worked\n- Rectus abdominis (six-pack muscles)\n- Hip flexors\n- Lower back muscles\n\n## Common Mistakes\n- Using momentum: Avoid using momentum to lift your upper body. Focus on controlled movements and use your abdominal muscles to initiate the movement.\n- Neck strain: Do not pull on your neck with your hands during the exercise. Use your fingertips for light support only.\n- Arching the lower back: Keep your lower back in contact with the ground throughout the movement to maintain proper form and prevent strain on the lower back.\n\n## Safety Precautions\n- Consult with a healthcare professional before starting any new exercise program, especially if you have a history of back or neck problems.\n- If you experience any pain or discomfort during the exercise, stop immediately and seek medical advice.\n- Engage your core muscles and maintain proper form throughout the exercise to minimize the risk of injury.\n- If you have difficulty maintaining stability or if you have a weak core, it is recommended to perform this exercise under the supervision of a qualified fitness professional.",
    "images": [
      "body-works-api.up.railway.app/assets/images/0001/1.jpeg",
      "body-works-api.up.railway.app/assets/images/0001/2.jpeg",
      "body-works-api.up.railway.app/assets/images/0001/3.jpeg",
      "body-works-api.up.railway.app/assets/images/0001/4.jpeg",
      "body-works-api.up.railway.app/assets/images/0001/5.jpeg"
    ],
    "gifUrl": "body-works-api.up.railway.app/assets/gifs/0001.gif",
    "videos": [
      "https://www.youtube.com/watch?v=-B9lsTWsJCo",
      "https://www.youtube.com/watch?v=FXalPpHfkZk",
      "https://www.youtube.com/watch?v=nxFgeTpBP6s",
      "https://www.youtube.com/watch?v=A7Y2-G4zOUA",
      "https://www.youtube.com/watch?v=Mm6spB-hms8"
    ],
    "keywords": [
      "3/4 sit-up",
      "Abdominal exercise",
      "Rectus abdominis",
      "Six-pack muscles",
      "Hip flexors",
      "Lower back muscles",
      "Core strength",
      "Abdominal stability",
      "Exercise instructions",
      "Variations",
      "Beginner variation",
      "Advanced variation",
      "Muscles worked",
      "Common mistakes",
      "Safety precautions",
      "Healthcare professional",
      "Back and neck problems",
      "Pain and discomfort",
      "Proper form",
      "Qualified fitness professional"
    ]
  }
}
```
### 3. Get Equipments Information

- **Endpoint :** `/equipments`
- **Description :** `Making a GET request on this link will return an array of all the equipments that may be used to filter the data from the exercise api.`
- **Method :** GET
- **API will look like this :**
```
https://body-works-api.up.railway.app/equipments
```
- **Response type :**
```
Array of objects containing the following entries:

exerciseCount: number
equipment: string
```
- **Sample Response:**
```json
{
  "totalEquipments": 28,
  "data": [
    {
      "imageUrl": "localhost:8000/assets/category-images/equipment-images/body-weight.webp",
      "equipment": "body weight",
      "exerciseCount": 315
    },
    {
      "imageUrl": "localhost:8000/assets/category-images/equipment-images/leverage-machine.webp",
      "equipment": "leverage machine",
      "exerciseCount": 83
    }
  ]
}
```
### 4. Get Target Muscles Information

- **Endpoint :** `/targetMuscles`
- **Description :** `Making a GET request on this link will return an array of all the target muscles that may be used to filter the data from the exercise api.
`
- **Method :** GET
- **API will look like this :**
```
https://body-works-api.up.railway.app/targetMuscles
```
- **Response type :**
```
Array of objects containing the following entries:

exerciseCount: number
equipment: string
```
- **Sample Response:**
```json
{
  "totalTargetMuscles": 19,
  "data": [
    {
      "imageUrl": "localhost:8000/assets/category-images/target-muscle-images/abs.webp",
      "targetMuscle": "abs",
      "exerciseCount": 170
    },
    {
      "imageUrl": "localhost:8000/assets/category-images/target-muscle-images/glutes.webp",
      "targetMuscle": "glutes",
      "exerciseCount": 277
    }
  ]
}
```
### 5. Get Body Parts Information

- **Endpoint :** `/bodyParts`
- **Description :** `Making a GET request on this link will return an array of all the body parts that may be used to filter the data from the exercise api.`
- **Method :** GET
- **API will look like this :**
```
https://body-works-api.up.railway.app/bodyParts
```
- **Response type :**
```
Array of objects containing the following entries:

exerciseCount: number
equipment: string
```
- **Sample Response:**
```json
{
  "totalBodyParts": 10,
  "data": [
    {
      "imageUrl": "localhost:8000/assets/category-images/bodypart-images/waist.webp",
      "bodyPart": "waist",
      "exerciseCount": 163
    },
    {
      "imageUrl": "localhost:8000/assets/category-images/bodypart-images/upper-legs.webp",
      "bodyPart": "upper legs",
      "exerciseCount": 221
    },
    {
      "imageUrl": "localhost:8000/assets/category-images/bodypart-images/chest.webp",
      "bodyPart": "chest",
      "exerciseCount": 157
    }
  ]
}
```
### 6. Get Routines Information

- **Endpoint :** `/routines`
- **Description :** `Making a GET request on this link will return an array of all the routines which match the assigned filters.`
- **Method :** GET
- **Params :**
```
limit : 10
page : 1
goal : eg.build muscle
type : eg.full body
level : eg.beginner
duration : eg.4 weeks
days_per_week : eg.4
time : eg.30-60 minutes
equipment : eg.bodyweight
gender : eg.male
category : eg.Workout for men
search : eg.anything related to routine
```

- **API will look like this :**
```
https://body-works-api.up.railway.app/routines?limit=10&page=1

```

- **Response type :**
```
Array of objects containing the following entries:

category: string[];
routine: {
  routine_title: string;
  routine_description: string;
  routine_imageUrl: string;
  workout_summary: {
     Main Goal: string; 
     Workout Type: string;
     Training Level: string;
     Program Duration: string;
     Days Per Week: string; 
     Time Per Workout: string;
     Equipment Required: string;
     Target Gender": string;
};
workout_plan: {
     heading: string | null;
     day_plan: string;
}[];
id : number;
```
- **Sample Response:**
```json
{
  "totalRoutines": 604,
  "totalPages": 302,
  "finalData": [
    {
      "category": [
        "Workouts For Men",
        "Muscle Building",
        "Full Body",
        "Bodyweight",
        "At Home"
      ],
      "routine": {
        "routine_title": "Body Like A God: A Complete Bodyweight Muscle Building Plan",
        "routine_description": "No equipment or gym? No problem. Build muscle at home with this classic bodyweight training system. This is a flexible training system that focuses on the use of exercise complexes.",
        "routine_imageUrl": "body-works-api.up.railway.app/assets/routine/1.webp",
        "workout_summary": {
          "Main Goal": "Build Muscle",
          "Workout Type": "Full Body",
          "Training Level": "Beginner",
          "Program Duration": "4 weeks",
          "Days Per Week": "4",
          "Time Per Workout": "30-60 minutes",
          "Equipment Required": "Bodyweight",
          "Target Gender": "Male & Female"
        },
        "workout_plan": [
          {
            "heading": "Complex 1",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 1</td>\n</tr>\n<tr>\n<td> Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Medium-Grip Pull Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Handstand or Jackknife Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Diamond Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Inverted Rack Curl Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 2</td>\n</tr>\n<tr>\n<td> Single-Leg Calf Raise</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Jump Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Walking Lunge</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Hanging Leg Raise</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Short All-Out Sprint Outdoors or on Treadmill</td>\n<td> 2-5</td>\n<td> Distance &amp; Duration varies according to fitness level &amp; experience.</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Complex 2",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 1</td>\n</tr>\n<tr>\n<td> Feet Elevated Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Wide Grip Inverted Row</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Rack Triceps Press or Parallel Bar Dips</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Shoulder Width Reverse Grip Pull Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Floor Crunch or Planks</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 2</td>\n</tr>\n<tr>\n<td> Box Jump or Jump Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Bulgarian Split Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Reverse Lunge</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Bench Step Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Short All-Out Sprint Outdoors or on Treadmill</td>\n<td> 2-5</td>\n<td> Distance &amp; Duration varies according to fitness level &amp; experience.</td>\n</tr>\n</tbody>\n</table>"
          }
        ]
      },
      "id": 1
    },
    {
      "category": [
        "Workouts For Men",
        "Muscle Building"
      ],
      "routine": {
        "routine_title": "“No Juice” Advanced Bodybuilding Workout Routine",
        "routine_description": "Avoid plateauing with the \"No Juice\" routine, which manipulates intensity, frequency, and volume to help you continue progressing in the gym.",
        "routine_imageUrl": "body-works-api.up.railway.app/assets/routine/2.webp",
        "workout_summary": {
          "Main Goal": "Build Muscle",
          "Workout Type": "Split",
          "Training Level": "Advanced",
          "Program Duration": "8 weeks",
          "Days Per Week": "6",
          "Time Per Workout": "60-75 minutes",
          "Equipment Required": "Barbell, Bodyweight, Cables, Dumbbells, Machines",
          "Target Gender": "Male & Female"
        },
        "workout_plan": [
          {
            "heading": "Day 1: Chest & Back",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"3\"> Bench Press: work up to a 5 rep max for the day</td>\n</tr>\n<tr>\n<td> - Set 1 at 50%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 2 at 60%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 3 at 70%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 4 at 80%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 5 at 90%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 6 at 100%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> Incline Dumbbell Press</td>\n<td> 3</td>\n<td> 6-8</td>\n</tr>\n<tr>\n<td> Dips</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Pullups</td>\n<td> 3</td>\n<td> 5-8</td>\n</tr>\n<tr>\n<td> Pendlay Rows</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Pulldowns</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 2: Legs",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"3\"> Squats: work up to a 5 rep max for the day</td>\n</tr>\n<tr>\n<td> - Set 1 at 50%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 2 at 60%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 3 at 70%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 4 at 80%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 5 at 90%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> - Set 6 at 100%</td>\n<td> 1</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> Leg Press</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Stiff-Legged Deadlift</td>\n<td> 5</td>\n<td> 5</td>\n</tr>\n<tr>\n<td> Hamstring Curls</td>\n<td> 3</td>\n<td> 6-8</td>\n</tr>\n<tr>\n<td> Calf-Raise</td>\n<td> 5</td>\n<td> 10</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 3: Shoulders & Arms",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Military Press or Dumbbell Press</td>\n<td> 3</td>\n<td> 6-8</td>\n</tr>\n<tr>\n<td> Lateral Raises</td>\n<td> 5</td>\n<td> 10</td>\n</tr>\n<tr>\n<td> Barbell Curls</td>\n<td> 5</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Dumbbell Curls</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 4: Rest",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Off</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 5: Chest, Shoulders, & Triceps",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Flat Dumbbell Press</td>\n<td> 5</td>\n<td> 20-6 (Pyramiding)</td>\n</tr>\n<tr>\n<td> Incline Dumbbell Press</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Hammer Strength Press</td>\n<td> 3</td>\n<td> 10</td>\n</tr>\n<tr>\n<td> Cable Flys</td>\n<td> 3</td>\n<td> 12-15</td>\n</tr>\n<tr>\n<td> Lateral Raises</td>\n<td> 5</td>\n<td> 15-20</td>\n</tr>\n<tr>\n<td> Reverse-Grip Pull-Downs</td>\n<td> 5</td>\n<td> 15-20</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 6: Back & Biceps",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Barbell Rows</td>\n<td> 5</td>\n<td> 20-8 (Pyramiding)</td>\n</tr>\n<tr>\n<td> Barbell Shrugs</td>\n<td> 3</td>\n<td> 15-20</td>\n</tr>\n<tr>\n<td> Rack Deadlifts</td>\n<td> 3</td>\n<td> 10-12</td>\n</tr>\n<tr>\n<td> Pullups</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Pulldowns</td>\n<td> 3</td>\n<td> 6-10</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 7: Legs",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Front Squats</td>\n<td> 5</td>\n<td> 20-8 (Pyramiding)</td>\n</tr>\n<tr>\n<td> Leg Extensions</td>\n<td> 5</td>\n<td> 10</td>\n</tr>\n<tr>\n<td> Hamstring Curls</td>\n<td> 5</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Seated Calf Raise</td>\n<td> 5</td>\n<td> 6-10</td>\n</tr>\n<tr>\n<td> Standing Calf Raise</td>\n<td> 3</td>\n<td> 8-12</td>\n</tr>\n</tbody>\n</table>"
          },
          {
            "heading": "Day 8: Rest",
            "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td> Off</td>\n</tr>\n</tbody>\n</table>"
          }
        ]
      },
      "id": 2
    }
  ]
}
```
### 7. Get specific routine Information

- **Endpoint :** `/routines/<id>`
- **Description :** `Making a GET request on this link will return an routine which corresponds to the id.`
- **Method :** GET
- **Params :**
```
id : eg.1
```
- **API will look like this :**
```
https://body-works-api.up.railway.app/routines/1
```
- **Response type :**
```
category: string[];
routine: {
  routine_title: string;
  routine_description: string;
  routine_imageUrl: string;
  workout_summary: {
     Main Goal: string; 
     Workout Type: string;
     Training Level: string;
     Program Duration: string;
     Days Per Week: string; 
     Time Per Workout: string;
     Equipment Required: string;
     Target Gender": string;
};
workout_plan: {
     heading: string | null;
     day_plan: string;
}[];
id : number;
```
- **Sample Response:**
```json
{
    "category": [
        "Workouts For Men",
        "Muscle Building",
        "Full Body",
        "Bodyweight",
        "At Home"
    ],
    "routine": {
        "routine_title": "Body Like A God: A Complete Bodyweight Muscle Building Plan",
        "routine_description": "No equipment or gym? No problem. Build muscle at home with this classic bodyweight training system. This is a flexible training system that focuses on the use of exercise complexes.",
        "routine_imageUrl": "localhost:8000/assets/routine/1.webp",
        "workout_summary": {
            "Main Goal": "Build Muscle",
            "Workout Type": "Full Body",
            "Training Level": "Beginner",
            "Program Duration": "4 weeks",
            "Days Per Week": "4",
            "Time Per Workout": "30-60 minutes",
            "Equipment Required": "Bodyweight",
            "Target Gender": "Male & Female"
        },
        "workout_plan": [
            {
                "heading": "Complex 1",
                "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 1</td>\n</tr>\n<tr>\n<td> Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Medium-Grip Pull Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Handstand or Jackknife Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Diamond Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Inverted Rack Curl Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 2</td>\n</tr>\n<tr>\n<td> Single-Leg Calf Raise</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Jump Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Walking Lunge</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Hanging Leg Raise</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Short All-Out Sprint Outdoors or on Treadmill</td>\n<td> 2-5</td>\n<td> Distance &amp; Duration varies according to fitness level &amp; experience.</td>\n</tr>\n</tbody>\n</table>"
            },
            {
                "heading": "Complex 2",
                "day_plan": "<table>\n<tbody>\n<tr>\n<th> Exercise</th>\n<th> Sets</th>\n<th> Reps</th>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 1</td>\n</tr>\n<tr>\n<td> Feet Elevated Push Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Wide Grip Inverted Row</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Rack Triceps Press or Parallel Bar Dips</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Shoulder Width Reverse Grip Pull Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Floor Crunch or Planks</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td colspan=\"4\"> Complex 2</td>\n</tr>\n<tr>\n<td> Box Jump or Jump Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Bulgarian Split Squat</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Reverse Lunge</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Bench Step Up</td>\n<td> 2-5</td>\n<td> 10-20</td>\n</tr>\n<tr>\n<td> Short All-Out Sprint Outdoors or on Treadmill</td>\n<td> 2-5</td>\n<td> Distance &amp; Duration varies according to fitness level &amp; experience.</td>\n</tr>\n</tbody>\n</table>"
            }
        ]
    },
    "id": 1
}
```
