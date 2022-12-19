const { expect } = require('chai');
const request = require('supertest');
const { Song, Album, User } = require('../../src/models');
const s3 = require('../../src/aws/s3');
const sinon = require('sinon');
const { authStub, app } = require('../test-config');

describe('/songs', () => {
  let fakeResolve;
  let user;
  let song;
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
    

    try {
      const fakeUserData = {
        name: 'validName',
        email: 'valid@email.com',
        password: 'validPassword',
      };
      user = await User.create(fakeUserData);

      const fakeAlbumData = {
        name: 'validName',
        url: 'validKey',
        UserId: user.id,
      };
      song = await Album.create(fakeAlbumData);

      validData = {
        name: 'validName',
        position: 0,
        AlbumId: song.id,
      };

      fakeResolve = `url.com/${user.id}/fakeResolve`;
      sinon.stub(s3, 'uploadFile').resolves(fakeResolve);
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
    });

    it("returns 500 if name field doesn't exist", async () => {
      const { status, body } = await request(app)
        .post('/songs')
        .field('AlbumId', validData.AlbumId)
        .field('position', validData.position)
        .attach('audio', buffer, 'fake.mp3');

      expect(status).to.equal(500);
      expect(body.message).to.equal(
        'Error: notNull Violation: Must provide a song name'
      );
    });

    it("returns 404 if AlbumId field doesn't exist", async () => {
      const { status, body } = await request(app)
        .post('/songs')
        .field('name', validData.name)
        .field('position', validData.position)
        .attach('audio', buffer, 'fake.mp3');

      expect(status).to.equal(500);
      expect(body.message).to.equal(
        'Error: notNull Violation: Song must have an Album'
      );
    });

    it("returns 404 if AlbumId doesn't match an song of a valid User", async () => {
      const { status, body } = await request(app)
        .post('/songs')
        .field('name', validData.name)
        .field('AlbumId', 999)
        .field('position', validData.position)
        .attach('audio', buffer, 'fake.mp3');

      console.log(body.message);
      expect(status).to.equal(500);
      expect(body.message).to.equal(
        'Error: insert or update on table "Songs" violates foreign key constraint "Songs_AlbumId_fkey"'
      );
    });

    it('returns 400 if the audio file has the wrong key', async () => {
      const { status, body } = await request(app)
        .post('/songs')
        .field('name', validData.name)
        .field('AlbumId', validData.AlbumId)
        .field('position', validData.position)
        .attach('file', buffer, 'fake.mp3');

      expect(status).to.equal(400);
      expect(body.message).to.equal('File is wrong type');
    });

    it("returns 400 if the file doesn't exist", async () => {
      const { status, body } = await request(app)
        .post('/songs')
        .field('name', validData.name)
        .field('AlbumId', validData.AlbumId)
        .field('position', validData.position);

      expect(status).to.equal(400);
      expect(body.message).to.equal('file required');
    });
  });

  describe('with records in the database', () => {
    let songs;

    beforeEach(async () => {
      songs = await Promise.all([
        Song.create({
          name: 'fakeName1',
          AlbumId: song.id,
          url: `url.com/${user.id}/fakeUrl1`,
          position: 0,
        }),
        Song.create({
          name: 'fakeName2',
          AlbumId: song.id,
          url: `url.com/${user.id}/fakeUrl2`,
          position: 1,
        }),
      ]);
    });

    describe('GET /songs', () => {
      it('returns all songs in the database', async () => {
        const { status, body } = await request(app).get('/songs');

        expect(status).to.equal(200);
        expect(body.length).to.equal(songs.length);
        body.forEach((song) => {
          const expected = songs.find((item) => item.name === song.name);

          expect(song.id).to.equal(expected.id);
        });
      });
    });

    describe('/songs/:songId', () => {
      describe('GET /songs/:songId', () => {
        it('gets the song with the specified id', async () => {
          const song = songs[0];
          const { status, body } = await request(app).get(`/songs/${song.id}`);

          expect(status).to.equal(200);
          expect(body.name).to.equal(song.name);
          expect(body.url).to.equal(song.url);
        });

        it('returns 404 if no song exists with the specified id', async () => {
          const { status, body } = await request(app).get('/songs/9999');

          expect(status).to.equal(404);
          expect(body.message).to.equal('The song could not be found.');
        });
      });

      describe('PATCH /songs/:songId', () => {
        it('edits song with specified id', async () => {
          const newName = 'newName';
          const song = songs[0]
          const { status } = await request(app).patch(`/songs/${song.id}`).field('name', newName);
          const updatedSongRecord = await Song.findByPk(song.id, {
            raw: true,
          });

          expect(status).to.equal(200);
          expect(updatedSongRecord.name).to.equal(newName);
        });

        it('returns 404 if no song exists with the specified id', async () => {
          const newName = 'newName';
          const { status, body } = await request(app).patch('/songs/9999').field('name', newName);

          expect(status).to.equal(404);
          expect(body.message).to.equal('The song could not be found');
        });
      });

      describe('DELETE /songs/:songId', () => {
        it('deletes song with specified id', async () => {
          const { id } = songs[0];
          const { status } = await request(app).delete(`/songs/${id}`);
          const deletedSongRecord = await Song.findByPk(id, {
            raw: true,
          });

          expect(status).to.equal(204);
          expect(deletedSongRecord).to.be.null;
        });

        it('returns 404 if no song exists with the specified id', async () => {
          const { status } = await request(app).delete('/songs/9999');

          expect(status).to.equal(404);
        });
      });
    });
  });
});
