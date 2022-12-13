const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt');

describe('/users', () => {
  before(async () => {
    try {
      await User.sequelize.sync();
    } catch (err) {
      console.error(err);
    }
  });

  afterEach(async () => {
    try {
      await User.destroy({ where: {} });
    } catch (err) {
      console.error(err);
    }
  });

  describe('POST /users/signup', () => {
    it('creates a new user in the database', async () => {
      try {
        const data = {
          name: 'validName',
          email: 'valid@email.com',
          password: 'validPassword',
        };
        const { status, body } = await request(app)
          .post('/users/signup')
          .send(data);
        const newUserRecord = await User.findByPk(body.id, {
          raw: true,
        });

        const passwordsMatch = await bcrypt.compare(
          data.password,
          newUserRecord.password
        );

        expect(status).to.equal(201);
        expect(body.name).to.equal(data.name);
        expect(body.email).to.equal(data.email);
        expect(newUserRecord.name).to.equal(data.name);
        expect(newUserRecord.email).to.equal(data.email);
        expect(passwordsMatch).to.be.true;
      } catch (err) {
        throw new Error(err);
      }
    });

    it('returns 400 if name is empty', async () => {
      const data = {
        name: '',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data);

      expect(status).to.equal(400);
      expect(body.error).to.equal('Name must have a value');
    });

    it('returns 400 if email is empty', async () => {
      const data = {
        name: 'validName',
        email: '',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data);

      expect(status).to.equal(400);
      expect(body.error).to.equal('Email must have a value');
    });

    it('returns 400 if email is not valid', async () => {
      const data = {
        name: 'validName',
        email: 'notValidEmail',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data);

      expect(status).to.equal(400);
      expect(body.error).to.equal('Email must be valid');
    });

    it('returns 400 if password is less than 8 characters', async () => {
      const data = {
        name: 'validName',
        email: 'valid@email.com',
        password: '',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data);

      expect(status).to.equal(400);
      expect(body.error).to.equal('Password must be atleast 8 characters long');
    });

    it('returns 409 if a user with that name already exists', async () => {
      const data1 = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      await request(app).post('/users/signup').send(data1);

      const data2 = {
        name: 'validName',
        email: 'valid2@email.com',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data2);

      expect(status).to.equal(409);
      expect(body.error).to.equal('Username already taken');
    });

    it('returns 409 if a user with that email already exists', async () => {
      const data1 = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      await request(app).post('/users/signup').send(data1);

      const data2 = {
        name: 'validName2',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data2);

      expect(status).to.equal(409);
      expect(body.error).to.equal('Authentication failed');
    });
  });

  describe('POST /users/login', () => {
    it('logs user in if valid user exists and credentials match', async () => {
      const data = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };

      await request(app).post('/users/signup').send(data);

      const { status, body } = await request(app)
        .post('/users/login')
        .send(data);

      expect(status).to.equal(201);
      expect(body.name).to.equal(data.name);
      expect(body.email).to.equal(data.email);
    });

    it("returns 401 if password don't match", async () => {
      const data = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };

      await request(app).post('/users/signup').send(data);

      data.password = 'differentPassword';
      const { status, body } = await request(app)
        .post('/users/login')
        .send(data);

      expect(status).to.equal(401);
      expect(body.error).to.equal('Authentication failed');
    });

    it("returns 401 if the email doesn't exist", async () => {
      const data = {
        email: 'valid@email.com',
        password: 'validPassword',
      };

      const { status, body } = await request(app)
        .post('/users/login')
        .send(data);

      expect(status).to.equal(401);
      expect(body.error).to.equal('Authentication failed');
    });
  });
});
