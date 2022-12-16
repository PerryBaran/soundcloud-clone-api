const { expect } = require('chai');
const request = require('supertest');
const { Album, User } = require('../../src/models');
const s3 = require('../../src/aws/s3');
const sinon = require('sinon');
const { authStub, app } = require('../test-config');

describe('/albums', () => {
  const fakeResolve = 'a string';
  let user;

  before(async () => {
    try {
      await User.sequelize.sync();
      await Album.sequelize.sync();
      
    } catch (err) {
      console.error('that annoying error');
    }
  });

  beforeEach(async () => {
    sinon.stub(s3, 'uploadFile').resolves(fakeResolve);

    try {
      const fakeUserData = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      user = await User.create(fakeUserData);

      authStub.callsFake((req, _, next) => {
        req.user = { id: user.id };
        next();
      });

    } catch (err) {
      console.error(err);
    }
  });

  afterEach(async () => {
    sinon.restore();
    try {
      await User.destroy({ where: {} });
      await Album.destroy({ where: {} });
    } catch (err) {
      console.error(err);
    }
  });

  describe('POST /albums', () => {
    let validData;
    const buffer = Buffer.from('fake data');

    beforeEach(() => {
      validData = {
        name: 'validName',
        UserId: user.id,
      };
    });

    it('creates a new album in the database', async () => {
      try {
        const { status, body } = await request(app)
          .post('/albums')
          .field('name', validData.name)
          .attach('image', buffer, 'fake.png');
        const newAlbumRecord = await Album.findByPk(body.id, {
          raw: true,
        });

        expect(status).to.equal(200);
        expect(body.name).to.equal(validData.name);
        expect(body.UserId).to.equal(validData.UserId);
        expect(body.url).to.equal(fakeResolve);
        expect(newAlbumRecord.name).to.equal(body.name);
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 500 if name field doesn't exist", async () => {
      try {
        const { status, body } = await request(app)
          .post('/albums')
          .attach('image', buffer, 'fake.png');

        expect(status).to.equal(500);
        expect(body.message).to.equal(
          'Error: notNull Violation: Must provide an album name'
        );
      } catch (err) {
        throw new Error(err);
      }
    });

    it('returns 400 if the image file has the wrong key', async () => {
      try {
        const { status, body } = await request(app)
          .post('/albums')
          .field('name', validData.name)
          .attach('audio', buffer, 'fake.png');

        expect(status).to.equal(400);
        expect(body.message).to.equal('File is wrong type');
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 400 if the file doesn't exist", async () => {
      try {
        const { status, body } = await request(app)
          .post('/albums')
          .field('name', validData.name);

        expect(status).to.equal(400);
        expect(body.message).to.equal('file required');
      } catch (err) {
        throw new Error(err);
      }
    });
  });
});
