import request from 'supertest';

import { app } from '../app.js';

describe('GET /api/v1/exercises', () => {
  it('should return 200 with the list of exercises', async () => {
    const res = await request(app).get('/api/v1/exercises?limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return pagination metadata', async () => {
    const res = await request(app).get('/api/v1/exercises?limit=5&page=1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalExercises');
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
  });
});

describe('GET /api/v1/exercises/:id', () => {
  it('should return 200 and the exercise data for ID 1', async () => {
    const res = await request(app).get('/api/v1/exercises/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.exerciseId).toBe(1);
  });

  it('should return 404 for a non-existent ID', async () => {
    const res = await request(app).get('/api/v1/exercises/99999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Exercise not found.');
  });

  it('should return 400 for an invalid ID format', async () => {
    const res = await request(app).get('/api/v1/exercises/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid ExerciseId format.');
  });
});
