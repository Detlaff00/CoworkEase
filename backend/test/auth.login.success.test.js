const request = require('supertest');
const app = require('../index');

describe('Auth: successful login', () => {
    const user = {
        email: 'loginuser@example.com',
        password: 'pass5678',
        full_name: 'Login User'
    };

    beforeAll(async () => {
        await request(app).post('/auth/register').send(user);
    });

    it('should return 200, set HTTP-only cookie and message', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: user.email, password: user.password });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.body).toHaveProperty('message', 'Успешный вход');
    });
});