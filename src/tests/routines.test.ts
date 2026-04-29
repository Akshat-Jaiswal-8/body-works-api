import request from 'supertest';

import { app } from '../app.js';

describe('Routines API', () => {
  it('should return a list of routines with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/routines?limit=3&page=1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('totalRoutines');
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 3);
  });

  it('should return search results for a specific query', async () => {
    const res = await request(app).get('/api/v1/routines?limit=2&page=1&search=muscle');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return individual routine data by ID', async () => {
    const res = await request(app).get('/api/v1/routines/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id_');
    expect(res.body.data).toHaveProperty('routine');
  });

  it('should return matching schema for filters endpoint', async () => {
    const res = await request(app).get('/api/v1/routines/filters?filter=category');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('totalRoutinesFilter');
    expect(res.body).toHaveProperty('count');
    expect(res.body.data).toHaveProperty('category');
    expect(Array.isArray(res.body.data.category)).toBe(true);
  });

  it('should return 400 for an invalid filter parameter', async () => {
    const res = await request(app).get('/api/v1/routines/filters?filter=invalid_filter');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
