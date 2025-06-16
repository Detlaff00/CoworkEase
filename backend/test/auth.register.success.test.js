const request = require('supertest');
const app = require('../index');

describe('Auth: successful registration', () => {
    it('should return 201 and user data for valid payload', async () => {
        // Generate a unique email for each test run
        const uniqueEmail = `user_${Date.now()}@example.com`;
        const payload = {
            email: uniqueEmail,
            password: 'strongPass1',
            full_name: 'Unique User'
        };
        const res = await request(app)
            .post('/auth/register')
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(uniqueEmail);
        expect(res.body.full_name).toBe(payload.full_name);
    });
});