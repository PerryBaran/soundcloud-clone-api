const { expect } = require('chai');
const request = require('supertest');
const { Song, Album, User } = require('../../src/models');
const s3 = require('../../src/aws/s3');
const sinon = require('sinon');
const { authStub, app } = require('../test-config');

describe('/songs', () => {
  const fakeResolve = 'fake url';
  let album;
  let validData;

  before(async () => {
    try {
      await User.sequelize.sync();
      await Album.sequelize.sync();
      await Song.sequelize.sync();
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
      const user = await User.create(fakeUserData);

      const fakeAlbumData = {
        name: 'validName',
        url: 'validKey',
        UserId: user.id,
      };
      album = await Album.create(fakeAlbumData);
  
      validData = {
        name: 'validName',
        position: 0,
        AlbumId: album.id,
      };

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
      await Song.destroy({ where: {} });
    } catch (err) {
      console.error(err);
    }
  });

  describe('POST /songs', () => {
    const buffer = Buffer.from('fake data');

    it('creates a new song in the database', async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('name', validData.name)
          .field('AlbumId', validData.AlbumId)
          .field('position', validData.position)
          .attach('audio', buffer, 'fake.mp3');
        const newSongRecord = await Song.findByPk(body.id, {
          raw: true,
        });

        expect(status).to.equal(200);
        expect(body.name).to.equal(validData.name);
        expect(body.AlbumId).to.equal(validData.AlbumId);
        expect(body.position).to.equal(validData.position.toString());
        expect(body.url).to.equal(fakeResolve);
        expect(newSongRecord.name).to.equal(body.name);
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 500 if name field doesn't exist", async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('AlbumId', validData.AlbumId)
          .field('position', validData.position)
          .attach('audio', buffer, 'fake.mp3');

        expect(status).to.equal(500);
        expect(body.message).to.equal(
          'Error: notNull Violation: Must provide a song name'
        );
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 404 if AlbumId field doesn't exist", async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('name', validData.name)
          .field('position', validData.position)
          .attach('audio', buffer, 'fake.mp3');

        expect(status).to.equal(500);
        expect(body.message).to.equal('Error: notNull Violation: Song must have an Album');
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 404 if AlbumId doesn't match an album of a valid User", async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('name', validData.name)
          .field('AlbumId', 999)
          .field('position', validData.position)
          .attach('audio', buffer, 'fake.mp3');

        console.log(body.message);
        expect(status).to.equal(500);
        expect(body.message).to.equal('Error: insert or update on table "Songs" violates foreign key constraint "Songs_AlbumId_fkey"');
      } catch (err) {
        throw new Error(err);
      }
    });

    it('returns 400 if the audio file has the wrong key', async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('name', validData.name)
          .field('AlbumId', validData.AlbumId)
          .field('position', validData.position)
          .attach('file', buffer, 'fake.mp3');

        expect(status).to.equal(400);
        expect(body.message).to.equal('File is wrong type');
      } catch (err) {
        throw new Error(err);
      }
    });

    it("returns 400 if the file doesn't exist", async () => {
      try {
        const { status, body } = await request(app)
          .post('/songs')
          .field('name', validData.name)
          .field('AlbumId', validData.AlbumId)
          .field('position', validData.position);

        expect(status).to.equal(400);
        expect(body.message).to.equal('file required');
      } catch (err) {
        throw new Error(err);
      }
    });
  });
});
