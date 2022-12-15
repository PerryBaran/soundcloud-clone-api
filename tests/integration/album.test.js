const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { Album, User } = require('../../src/models');
const s3 = require('../../src/aws/s3');
const sinon = require('sinon');

describe('/albums', () => {
  const fakeResolve = 'a string';
  const fakeUserData = {
    name: 'validName',
    email: 'valid@email.com',
    password: 'validPassword',
  };
  let user;

  before(async () => {
    try {
      await User.sequelize.sync();
      await Album.sequelize.sync();
    } catch (err) {
      console.error(err);
    }
  });

  beforeEach(async () => {
    sinon.stub(s3, 'uploadFileToS3').resolves(fakeResolve);

    try {
      user = await User.create(fakeUserData);
    } catch (err) {
      console.error(err);
    }
  });

  afterEach(async () => {
    sinon.restore();
    try {
      await User.destroy({ where: {} });
    } catch (err) {
      console.error(err);
    }
  });

  describe('POST /albums', () => {
    let validData;

    beforeEach(() => {
      validData = {
        name: 'validName',
        UserId: user.id,
      };
    });

    it('creates a new album in the database', async () => {
      try {
        const buffer = Buffer.from('fake data');
        const { status, body } = await request(app)
          .post('/albums')
          .set('Content-Type', 'multipart/form-data')
          .field('name', validData.name)
          .field('UserId', validData.UserId)
          .attach('image', buffer, 'fake.png');
        const newAlbumRecord = await Album.findByPk(body.id, {
          raw: true,
        });

        expect(status).to.equal(200);
        expect(body.name).to.equal(validData.name);
        expect(body.UserId).to.equal(validData.UserId);
        expect(body.key).to.equal(fakeResolve);
        expect(newAlbumRecord.name).to.equal(body.name);
      } catch (err) {
        throw new Error(err);
      }
    });
  });
});
