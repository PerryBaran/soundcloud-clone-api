# Soundcloud-Clone-API

An Express.js API that interacts with a sequelize database via CRUD requests to store and interact with user, album and song information. AWS S3 to be implemented to store audio and image data.

Implements Test-Driven development using Mocha and Chai.

Created as part of the Manchester Codes full-stack web development boot-camp.


## Table of Contents

1. [Dependencies](#dependencies)
2. [Setup](#setup)
3. [Commands](#commands)
4. [Routes](#routes)
5. [Attribution](#attribution)

## Dependencies

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)

### Dev Dependencies

- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Mocha](https://www.npmjs.com/package/mocha)
- [Chai](https://www.npmjs.com/package/chai)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Prettier](https://prettier.io/)
- [ESlint](https://www.npmjs.com/package/eslint)

## Setup

### Install Dependencies

```
$ npm i
```

### Database

If you have [Docker](https://docs.docker.com/) installed, To set the database up, pull and run a Postgres image with:

```
$ docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password -d postgres
```

### Environment variables


## Commands

To run the server use:

```
$ npm start
```

To run all tests use:

```
$ npm test
```

To only run unit tests use:

```
$ npm run unit-test
```

To run Prettier use:

```
$ npm run prettier
```

## Routes

## Attribution

Created by **Perry Baran** and **Nicola Giannotta**.