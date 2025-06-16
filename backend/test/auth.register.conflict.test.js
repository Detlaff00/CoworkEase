const request = require('supertest');
const app = require('../index');

describe('Auth: registration conflict', () => {
    const payload = {
        email: 'conflict@example.com',
        password: 'pass1234',
        full_name: 'Conflict User'
    };

    beforeAll(async () => {
        // Первый успешный запрос
        await request(app).post('/auth/register').send(payload);
    });

    it('should return 409 when registering with same email twice', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(payload);

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/используется/);
    });
});