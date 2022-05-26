const request = require('supertest');
const Express = require('express');

const bookingRoutes = require('../srcs/server/routes/bookings');
const repairRoutes = require('../srcs/server/routes/repair');
const feedbackRoutes = require('../srcs/server/routes/feedback');

const app = new Express();
app.use(Express.json());
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/repairs', repairRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);

describe('Invalid route test', () => {
  it('Should return 404 (root route)', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });

  it('Should return 404 (API route)', async () => {
    const res = await request(app).get('/api/v2');
    expect(res.statusCode).toBe(404);
  });

  it('Should return 404 (API route)', async () => {
    const res = await request(app).get('/api/v1/qwe');
    expect(res.statusCode).toBe(404);
  });

  it('Should return 404 (API route)', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.statusCode).toBe(404);
  });
});

describe('Booking Endpoint Tests', () => {
  const API_URL = '/api/v1/bookings/';

  it('List Bookings (no params)', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
  });

  it('List Bookings (invalid sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (invalid sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (sort on but no sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=Name`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (sort by but no sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (invalid filter on)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (invalid filter by)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (filter on but no filter by param)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=SuggestedDate`);
    expect(res.statusCode).toBe(400);
  });

  it('List Bookings (filter by but no filter on param)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=aasdf`);
    expect(res.statusCode).toBe(400);
  });

  it('retreive Booking (invalid id)', async () => {
    const res = await request(app).get(`${API_URL}/81b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });

  it('create Booking (missing body)', async () => {
    const res = await request(app).post(`${API_URL}/`);
    expect(res.statusCode).toBe(400);
  });

  it('create Booking (missing partial body)', async () => {
    const res = await request(app)
      .post(`${API_URL}/`)
      .send({ Name: 'asdf' });
    expect(res.statusCode).toBe(400);
  });

  it('update Booking (invalid id)', async () => {
    const res = await request(app).put(`${API_URL}/81b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Repair Endpoint Tests', () => {
  const API_URL = '/api/v1/repairs/';

  it('List Repairs (no params)', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
  });

  it('List Repairs (invalid sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (invalid sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (sort on but no sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=Name`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (sort by but no sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (invalid filter on)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (invalid filter by)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (filter on but no filter by param)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=SuggestedDate`);
    expect(res.statusCode).toBe(400);
  });

  it('List Repairs (filter by but no filter on param)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=aasdf`);
    expect(res.statusCode).toBe(400);
  });

  it('retreive Repair (invalid id)', async () => {
    const res = await request(app).get(`${API_URL}/83b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });

  it('create Repair (missing body)', async () => {
    const res = await request(app).post(`${API_URL}/`);
    expect(res.statusCode).toBe(400);
  });

  it('create Repair (missing partial body)', async () => {
    const res = await request(app)
      .post(`${API_URL}/`)
      .send({ TechnicianName: 'asdf' });
    expect(res.statusCode).toBe(400);
  });

  it('update Repair (invalid id)', async () => {
    const res = await request(app).put(`${API_URL}/81b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Feedback Endpoint Tests', () => {
  const API_URL = '/api/v1/feedbacks/';

  it('List Feedbacks (no params)', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
  });

  it('List Feedbacks (invalid sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (invalid sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (sort on but no sort by param)', async () => {
    const res = await request(app).get(`${API_URL}?sortOn=Name`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (sort by but no sort on param)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (invalid filter on)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (invalid filter by)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=asdf`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (filter on but no filter by param)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=SuggestedDate`);
    expect(res.statusCode).toBe(400);
  });

  it('List Feedbacks (filter by but no filter on param)', async () => {
    const res = await request(app).get(`${API_URL}?filterBy=aasdf`);
    expect(res.statusCode).toBe(400);
  });

  it('retreive Feedback (invalid id)', async () => {
    const res = await request(app).get(`${API_URL}/83b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });

  it('create Feedback (missing body)', async () => {
    const res = await request(app).post(`${API_URL}/`);
    expect(res.statusCode).toBe(400);
  });

  it('create Feedback (missing partial body)', async () => {
    const res = await request(app)
      .post(`${API_URL}/`)
      .send({ TechnicianName: 'asdf' });
    expect(res.statusCode).toBe(400);
  });

  it('update Feedback (invalid id)', async () => {
    const res = await request(app).put(`${API_URL}/81b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });
});
