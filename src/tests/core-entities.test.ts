import request from 'supertest';

import { app } from '../app.js';

describe('Core Entities API', () => {
  const testCases = [
    { endpoint: '/api/v1/bodyParts', name: 'bodyParts', totalKey: 'totalBodyParts' },
    { endpoint: '/api/v1/equipments', name: 'equipments', totalKey: 'totalEquipments' },
    { endpoint: '/api/v1/targetMuscles', name: 'targetMuscles', totalKey: 'totalTargetMuscles' },
  ];

  testCases.forEach(({ endpoint, name, totalKey }) => {
    describe(`${name} endpoints`, () => {
      it(`should return a list of ${name} with pagination metadata`, async () => {
        const res = await request(app).get(`${endpoint}?limit=2&page=1`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty(totalKey);
        expect(res.body).toHaveProperty('totalPages');
        expect(res.body).toHaveProperty('page', 1);
        expect(res.body).toHaveProperty('limit', 2);
      });

      it(`should apply search filter for ${name}`, async () => {
        const res = await request(app).get(`${endpoint}?limit=2&page=1&search=e`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });
  });
});
