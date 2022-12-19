const { expect } = require('chai');
const request = require('supertest');
const { User, Album, Song } = require('../../src/models');
const sinon = require('sinon');
const app = require('../../src/app');

describe('associations', () => {
  let users;
  let albums;
  let songs;

  before(async () => {
    try {
      await User.sequelize.sync();
      await Album.sequelize.sync();
      await Song.sequelize.syng();
    } catch (err) {
      console.error(err);
    }
  });

  beforeEach(async () => {
    try {
      users = await Promise.all([
        User.create({
          name: 'user1',
          email: 'user1@email.com',
          password: 'password1',
        }),
        User.create({
          name: 'user2',
          email: 'user2@email.com',
          password: 'password2',
        }),
      ]);

      albums = await Promise.all([
        Album.create({
          name: 'album1',
          UserId: users[0].id,
          url: `album1.com/${users[0].id}/random1`,
        }),
        Album.create({
          name: 'album2',
          UserId: users[1].id,
          url: `album2.com/${users[1].id}/random2`,
        }),
      ]);

      songs = await Promise.all([
        Song.create({
          name: 'song1',
          AlbumId: albums[0].id,
          url: `songs1.com/${albums[0].id}/random1`,
          position: 0,
        }),
        Song.create({
          name: 'song2',
          AlbumId: albums[0].id,
          url: `songs2.com/${albums[0].id}/random2`,
          position: 1,
        }),
        Song.create({
          name: 'song3',
          AlbumId: albums[1].id,
          url: `songs3.com/${albums[1].id}/random3`,
          position: 0,
        }),
      ]);
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

  describe('/users', () => {
    it('returns associated albums and associated songs', async () => {
      const { body } = await request(app).get('/users');

      body.forEach((user) => {
        user.Albums.forEach((album) => {
          const expectedAlbum = albums.find(
            (item) => item.UserId === user.id && item.id === album.id
          );

          expect(album.name).to.equal(expectedAlbum.name);
          album.Songs.forEach((song) => {
            const expectedSong = songs.find(
              (item) => item.AlbumId === album.id && item.id === song.id
            );

            expect(song.name).to.equal(expectedSong.name);
          });
        });
      });
    });
  });

  describe('/albums', () => {
    it('returns associated user and songs', async () => {
      const { body } = await request(app).get('/albums');

      body.forEach((album) => {
        const expectedUser = users.find((user) => user.id === album.UserId);

        expect(expectedUser.name).to.equal(album.User.name);

        album.Songs.forEach((song) => {
          const expectedSong = songs.find(
            (item) => item.AlbumId === album.id && song.id === item.id
          );

          expect(expectedSong.name).to.equal(song.name);
        });
      });
    });
  });

  describe('/songs', () => {
    it('returns associated album and associated user', async () => {
      const { body } = await request(app).get('/songs');

      body.forEach((song) => {
        const expectedAlbum = albums.find((album) => album.id === song.AlbumId);
        const expectedUser = users.find(
          (user) => user.id === song.Album.UserId
        );

        expect(expectedAlbum.name).to.equal(song.Album.name);
        expect(expectedUser.name).to.equal(song.Album.User.name);
      });
    });
  });
});
