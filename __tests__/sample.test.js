const request = require('supertest');
const Express = require('express');

const bookingRoutes = require('../srcs/server/routes/bookings');
const repairRoutes = require('../srcs/server/routes/repair');
const feedbackRoutes = require('../srcs/server/routes/feedback');
const technicianRoutes = require('../srcs/server/routes/technician');

const app = new Express();
app.use(Express.json());
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/repairs', repairRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/technicians', technicianRoutes);

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
    expect(res.body.data.length).toBe(2);
  });

  it('List Bookings (page size)', async () => {
    const res = await request(app).get(`${API_URL}?pageSize=1`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // test page cursor here
  it('List Bookings (sort)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending&sortOn=Reason`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].Reason.localeCompare(res.body.data[1].Reason)).toBe(1);
  });

  it('List Bookings (filter)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=Reason&filterBy=new title`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
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

  it('create Booking', async () => {
    const payload = {};

    payload.Reason = 'Techname';
    payload.Attachment = 'stuff.com';
    payload.Name = 'Name';
    payload.Email = 'mail@mail.mail';
    payload.Contact = '098765432';
    payload.Status = 'Pending';
    payload.SuggestedDate = '2022-06-21';
    payload.Address = '2-2-1, Taman Reqwew';
    const res = await request(app).post(`${API_URL}/`).send(payload);
    expect(res.statusCode).toBe(201);
  });

  it('check created Booking', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
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

  it('update Booking', async () => {
    const payload = {};
    const bookings = await request(app).get(API_URL);
    const booking = bookings.body.data[0];

    payload.Status = 'Confirmed';
    const res = await request(app).patch(`${API_URL}${booking.id}`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.Status).toBe('Confirmed');
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
    expect(res.body.data.length).toBe(2);
  });

  it('List Repairs (page size)', async () => {
    const res = await request(app).get(`${API_URL}?pageSize=1`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // test page cursor here
  it('List Repairs (sort)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending&sortOn=Technician`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].Technician.localeCompare(res.body.data[1].Technician)).toBe(-1);
  });

  it('List Repairs (filter)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=Status&filterBy=Resolved`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
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

  it('create Repair', async () => {
    const payload = {};
    const bookings = await request(app).get('/api/v1/bookings/');
    const technicians = await request(app).get('/api/v1/technicians/');

    payload.Technician = technicians.body.data[0].id;
    payload.Booking = bookings.body.data[0].id;
    payload.Status = 'OTW';
    const res = await request(app).post(`${API_URL}/`).send(payload);
    expect(res.statusCode).toBe(200);
  });

  it('check created Repair', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
  });

  it('update Repair (invalid id)', async () => {
    const res = await request(app).put(`${API_URL}/81b7098a-9101-4e80-9a0a-40c59a202c9d`);
    expect(res.statusCode).toBe(404);
  });

  it('update Repair', async () => {
    const payload = {};
    const repairs = await request(app).get(API_URL);
    const repair = repairs.body.data[0];

    payload.Status = 'Resolving';
    const res = await request(app).patch(`${API_URL}${repair.id}`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.Status).toBe('Resolving');
  });
});

describe('Feedback Endpoint Tests', () => {
  const API_URL = '/api/v1/feedbacks/';

  it('List Feedbacks (no params)', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('List Feedbacks (page size)', async () => {
    const res = await request(app).get(`${API_URL}?pageSize=1`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // test page cursor here
  it('List Feedbacks (sort)', async () => {
    const res = await request(app).get(`${API_URL}?sortBy=descending&sortOn=Remarks`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].Remarks.localeCompare(res.body.data[1].Remarks)).toBe(1);
  });

  it('List Feedbacks (filter)', async () => {
    const res = await request(app).get(`${API_URL}?filterOn=Rating&filterBy=5`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
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

  it('create Feedback', async () => {
    const payload = {};
    const repairs = await request(app).get('/api/v1/repairs/');

    payload.Remarks = 'okder';
    payload.Repair = repairs.body.data[0].id;
    payload.Attachment = 'okder.jpeg';
    payload.Type = 'Technician';
    payload.Rating = 12;
    const res = await request(app).post(`${API_URL}/`).send(payload);
    expect(res.statusCode).toBe(200);
  });

  it('check created Feedback', async () => {
    const res = await request(app).get(`${API_URL}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
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
