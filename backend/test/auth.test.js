
const request = require('supertest');
const app     = require('../index');

describe('Auth validation', () => {
  it('POST /auth/register without body should 400 and list errors', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.error)).toBe(true);
  });

  it('POST /auth/login without body should return 400', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.error)).toBe(true);
  });

  it('POST /auth/login with wrong credentials should return 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'no@user.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Неверные/);
  });
});