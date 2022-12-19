const { expect } = require('chai');
const request = require('supertest');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt');
const { authStub, app } = require('../test-config');
const s3 = require('../../src/aws/s3');
const sinon = require('sinon');

describe('/users', () => {
  before(async () => {
    try {
      await User.sequelize.sync();
    } catch (err) {
      console.message('that annoying error');
    }
  });

  afterEach(async () => {
    try {
      await User.destroy({ where: {} });
      sinon.restore();
    } catch (err) {
      console.message(err);
    }
  });

  describe('POST /users/signup', () => {
    it('creates a new user in the database', async () => {
      const data = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      const { status, body } = await request(app)
        .post('/users/signup')
        .send(data);
      const newUserRecord = await User.unscoped().findByPk(body.id, {
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
      expect(body.message).to.equal('Name must have a value');
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
      expect(body.message).to.equal('Email must have a value');
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
      expect(body.message).to.equal('Email must be valid');
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
      expect(body.message).to.equal(
        'Password must be atleast 8 characters long'
      );
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
      expect(body.message).to.equal('Username already taken');
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
      expect(body.message).to.equal('Authentication failed');
    });
  });

  describe('with records in the database', () => {
    let data;
    let users;

    beforeEach(async () => {
      try {
        data = [];
        users = [];
        const data1 = {
          name: 'validName1',
          email: 'valid@email.com',
          password: 'validPassword',
        };
        const user1 = await User.create({
          name: data1.name,
          email: data1.email,
          password: await bcrypt.hash(data1.password, 10),
        });
        users.push(user1);
        data.push(data1);

        const data2 = {
          name: 'validName2',
          email: 'valid2@email.com',
          password: 'validPassword2',
        };
        const user2 = await User.create({
          name: data2.name,
          email: data2.email,
          password: await bcrypt.hash(data2.password, 10),
        });
        data.push(data2);
        users.push(user2);

        authStub.callsFake((req, _, next) => {
          req.user = { id: user1.id };
          next();
        });
      } catch (err) {
        console.error(err);
      }
    });

    describe('POST /users/login', () => {
      it('logs user in if valid user exists and credentials match', async () => {
        const { status, body } = await request(app)
          .post('/users/login')
          .send(data[0]);

        expect(status).to.equal(201);
        expect(body.name).to.equal(data[0].name);
        expect(body.email).to.equal(data[0].email);
      });

      it("returns 401 if password don't match", async () => {
        data[0].password = 'differentPassword';
        const { status, body } = await request(app)
          .post('/users/login')
          .send(data[0]);

        expect(status).to.equal(401);
        expect(body.message).to.equal('Authentication failed');
      });

      it("returns 401 if the email doesn't exist", async () => {
        delete data[0].email;

        const { status, body } = await request(app)
          .post('/users/login')
          .send(data[0]);

        expect(status).to.equal(401);
        expect(body.message).to.equal('Authentication failed');
      });
    });

    describe('GET /users', () => {
      it('returns all users in the database', async () => {
        const { status, body } = await request(app).get('/users');

        expect(status).to.equal(200);
        expect(body.length).to.equal(data.length);
        body.forEach((user) => {
          const expected = data.find((item) => item.name === user.name);

          expect(user.email).to.equal(expected.email);
        });
      });

      it('returns queried user by name', async () => {
        const user = users[0];
        const { status, body } = await request(app).get(
          `/users?name=${user.name}`
        );

        expect(status).to.equal(200);
        expect(body.length).to.equal(1);
        expect(body[0].id).to.equal(user.id);
      });

      it('returns limited results by query', async () => {
        const { status, body } = await request(app).get('/users?limit=1');

        expect(status).to.equal(200);
        expect(body.length).to.equal(1);
      });
    });

    describe('/users/:userId', () => {
      describe('GET /users/:userId', () => {
        it('gets the user with the specified id', async () => {
          const user = users[0];
          const { status, body } = await request(app).get(`/users/${user.id}`);

          expect(status).to.equal(200);
          expect(body.name).to.equal(user.name);
          expect(body.email).to.equal(user.email);
          expect(body.password).to.be.undefined;
        });

        it('returns 404 if no user exists with the specified id', async () => {
          const { status, body } = await request(app).get('/users/9999');

          expect(status).to.equal(404);
          expect(body.message).to.equal('The user could not be found.');
        });
      });

      describe('PATCH /users/:userId', () => {
        it('updates user by id', async () => {
          const user = users[0];
          const newName = 'newName';
          const { status } = await request(app)
            .patch(`/users/${user.id}`)
            .send({
              name: newName,
            });

          const updatedUserRecord = await User.findByPk(user.id, {
            raw: true,
          });

          expect(status).to.equal(200);
          expect(updatedUserRecord.name).to.equal(newName);
          expect(updatedUserRecord.email).to.equal(user.email);
        });

        it("returns 401 if the userId doesn't match to user.id (from token authentication)", async () => {
          const newName = 'newName';
          const { status, body } = await request(app)
            .patch(`/users/${users[1].id}`)
            .send({
              name: newName,
            });

          expect(status).to.equal(401);
          expect(body.message).to.equal('Invalid Credentials');
        });

        it("returns 404 if the user doesn't exist", async () => {
          const id = 999;
          authStub.callsFake((req, _, next) => {
            req.user = { id: id };
            next();
          });
          const { status, body } = await request(app)
            .patch(`/users/${id}`)
            .send({
              name: 'newName',
            });

          expect(status).to.equal(404);
          expect(body.message).to.equal('The user could not be found.');
        });
      });
    });

    describe('DELETE /users/:userId/:password', () => {
      beforeEach(() => {
        sinon.stub(s3, 'deleteDirectory').resolves();
      });

      it('deletes user by id', async () => {
        const user = users[0];
        const userData = data[0];
        const { status } = await request(app).delete(
          `/users/${user.id}/${userData.password}`
        );

        const newUsersRecord = await User.findAll();

        expect(status).to.equal(204);
        expect(newUsersRecord.length).to.equal(data.length - 1);
        expect(newUsersRecord[0].id).to.not.equal(user.id);
      });

      it("returns 401 if the userId doesn't match to user.id (from token authentication)", async () => {
        const user = users[1];
        const userData = data[1];
        const { status, body } = await request(app).delete(
          `/users/${user.id}/${userData.password}`
        );

        expect(status).to.equal(401);
        expect(body.message).to.equal('Invalid Credentials');
      });

      it("returns 404 if the user doesn't exist", async () => {
        const id = 999;
        authStub.callsFake((req, _, next) => {
          req.user = { id: id };
          next();
        });
        const { status, body } = await request(app).delete(
          `/users/${id}/fakePassword`
        );

        expect(status).to.equal(404);
        expect(body.message).to.equal('The User could not be found.');
      });

      it("returns 401 if the password doesn't match the users password", async () => {
        const user = users[0];
        const { status, body } = await request(app).delete(
          `/users/${user.id}/wrongPassword`
        );

        expect(status).to.equal(401);
        expect(body.message).to.equal('Invalid Credentials');
      });
    });
  });
});
