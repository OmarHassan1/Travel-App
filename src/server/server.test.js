const request = require('supertest');
const app = require('./server');


describe('Test server express', () => {
    test('It should response the GET method', (done) => {
        request(app).get('/test').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});