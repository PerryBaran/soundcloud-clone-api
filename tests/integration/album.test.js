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
    });

    it("returns 500 if name field doesn't exist", async () => {
      const { status, body } = await request(app)
        .post('/albums')
        .attach('image', buffer, 'fake.png');

      expect(status).to.equal(500);
      expect(body.message).to.equal(
        'Error: notNull Violation: Must provide an album name'
      );
    });

    it('returns 400 if the image file has the wrong key', async () => {
      const { status, body } = await request(app)
        .post('/albums')
        .field('name', validData.name)
        .attach('audio', buffer, 'fake.png');

      expect(status).to.equal(400);
      expect(body.message).to.equal('File is wrong type');
    });

    it("returns 400 if the file doesn't exist", async () => {
      const { status, body } = await request(app)
        .post('/albums')
        .field('name', validData.name);

      expect(status).to.equal(400);
      expect(body.message).to.equal('file required');
    });
  });

  describe('with records in the database', () => {
    let albums;

    beforeEach(async () => {
      albums = await Promise.all([
        Album.create({
          name: 'fakeName1',
          UserId: user.id,
          url: 'fakeUrl1',
        }),
        Album.create({
          name: 'fakeName2',
          UserId: user.id,
          url: 'fakeUrl2',
        }),
      ]);
    });

    describe('GET /albums', () => {
      it('returns all albums in the database', async () => {
        const { status, body } = await request(app).get('/albums');

        expect(status).to.equal(200);
        expect(body.length).to.equal(albums.length);
        body.forEach((album) => {
          const expected = albums.find((item) => item.name === album.name);

          expect(album.id).to.equal(expected.id);
        });
      });
    });

    describe('/albums/:albumId', () => {
      describe('GET /albums/:albumId', () => {
        it('gets the album with the specified id', async () => {
          const album = albums[0];
          const { status, body } = await request(app).get(
            `/albums/${album.id}`
          );

          expect(status).to.equal(200);
          expect(body.name).to.equal(album.name);
          expect(body.url).to.equal(album.url);
        });

        it('returns 404 if no album exists with the specified id', async () => {
          const { status, body } = await request(app).get('/albums/9999');

          expect(status).to.equal(404);
          expect(body.message).to.equal('The album could not be found.');
        });
      });
    });
  });
});
