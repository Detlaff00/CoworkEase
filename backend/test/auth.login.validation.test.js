const request = require('supertest');
const app = require('../index');

describe('Auth: login validation', () => {
    it('should return 400 when body is empty', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({});
        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.error)).toBe(true);
    });

    it('should return 401 for wrong credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'noone@example.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/Неверные/);
    });
});