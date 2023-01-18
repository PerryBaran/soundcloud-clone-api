# Soundcloud-Clone-API

An Express.js API that interacts with a sequelize database via CRUD requests to store and interact with user, album and song information. AWS S3 implemented to store audio and image data.

Implements Test-Driven development using Mocha and Chai.

Created for the Command Shit (formally Manchester Codes) full-stack web development boot-camp final project.

[Front-End Repository](https://github.com/ngiannotta84/soundcloud-clone)

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
- [Bycrypt](https://www.npmjs.com/package/bcrypt)
- [JSONwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Cookie-Parser](https://www.npmjs.com/package/cookie-parser)
- [AWS-SDK](https://www.npmjs.com/package/aws-sdk)
- [Multer](https://www.npmjs.com/package/multer)
- [uuid](https://www.npmjs.com/package/uuid)
- [cors](https://www.npmjs.com/package/cors)

### Dev Dependencies

- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Mocha](https://www.npmjs.com/package/mocha)
- [Chai](https://www.npmjs.com/package/chai)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Prettier](https://prettier.io/)
- [ESlint](https://www.npmjs.com/package/eslint)
- [sinon](https://www.npmjs.com/package/sinon)

## Setup

### Clone Repo to a local file

```
$ git clone git@github.com:PerryBaran/soundcloud-clone-api.git
```

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

You will need to create a file to store your environment variables. These credentials allow you to connect to the database. Two environments will need to be created, one for production and one for testing.

Create a `.env` and a `.env.test` file in the root of the repo with values that meet the requirements:

```
PGUSER=[server name]
PGHOST=[host e.g. localhost]
PGPASSWORD=[server password]
PGDATABASE=[database name]
PGPORT=[Postgres connection port]
PORT=[local port]
JWT_SECRETKEY=[random string of characters]
AWS_ACCESS_KEY_ID=[AWS S3 Bucket access key]
AWS_SECRET_KEY=[AWS S3 Bucket secret key]
AWS_BUCKET_NAME=[AWS S3 Bucket name]
AWS_BUCKET_REGION=[AWS S3 Bucket region]
AWS_BUCKET_URL=[AWS S3 Bucket url]
```

## Deployment

App hosted on [Render](https://render.com/) at https://soundcloud-clone-api.onrender.com.

### How to Deploy on Render

### Create the Web Service

1. Create Render Account if not already done so.
2. Click **New** in the top right and then select **Web Service**.
3. Connect Render to your github account and then search for your repository and click **Connect**.
4. Give your service a unique **Name**, select a **Region**, select the correct **Branch** (usually main), select the **Environment**, add the **Build Command** (e.g. npm ci) and add a **Start Command** (e.g. node index.js).
5. Chose a **Plan** and then click **Create Web service**.

### Create the Database

1. Click **New** in the top right and then select **PostgreSQL** (if database is running on PostgreSQL.
2. Give your Database a **Name**.
3. Chose a **Region** and a **Plan**.
4. click **Create Database** and wait.

### Connect your Database and Web Service

1. On **Dashboard** open up your **Database**.
2. Scroll down to **Connections**.
3. Make note of the **Hostname**, **Port**, **Database**, **Username** and **Password**,
4. Return to the **Dashboard** and open up your **Web Service**.
5. Select **Enviroment** on the right hand side.
6. Click **Add Enviroment Variable**.
7. The **Key** should be the environment variable key as defined in your local **.env**. The value is the the corresponding information from the **Database** e.g. `KEY: DBHOST, value: [Hostname value] `. Add all fields mentioned above to the **Environment Variables** including any required for other service e.g. AWS information.

## Commands

To run the server use:

```
$ npm start
```

To run all tests use:

```
$ npm test
```

To run Prettier use:

```
$ npm run prettier
```

## Routes

<sub>**?** In Schema represents optional field</sub>

### /users

| Method | Route                    | Description                                                                                                         | Schema (JSON)                                                                          |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| POST   | /users/signup            | Create a new user and returns a cookie containing the new users name and id                                         | <pre>{<br /> "name": STRING,<br /> "email": STRING,<br /> "password": STRING<br />}    |
| POST   | /users/login             | Returns a cookie for containing user name and id for the matching user                                              | <pre>{<br /> "email": STRING,<br /> "password": STRING<br />}                          |
| Get    | /users                   | Returns all users. Optional query param "name" and "limit" to search by name or limit returned results respectively | N/A                                                                                    |
| Get    | /users/:userId           | Returns user the with specified ID                                                                                  | N/A                                                                                    |
| PATCH  | /users/:userId           | Updates user with the specified ID, requires JWT authentication                                                     | <pre>{<br /> "name"?: STRING,<br /> "email"?: STRING,<br /> "password"?: STRING<br />} |
| DELETE | /users/:userId/:password | Deletes the user with the specified ID if the password matches, requires JWT authentication                         | N/A                                                                                    |

### /albums

| Method | Route            | Description                                                                                                          | Schema (FormData)                                           |
| ------ | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| POST   | /albums          | Creates a new album, requires JWT authenticaiton to link the album to the user                                       | <pre>{<br /> name: STRING,<br /> image?: IMAGE-FILE,<br />} |
| GET    | /albums          | Returns all albums. Optional query param "name" and "limit" to search by name or limit returned results respectively | N/A                                                         |
| GET    | /albums/:albumId | Returns album the with specified ID                                                                                  | N/A                                                         |
| PATCH  | /albums/:albumId | Updates album with the specified ID, requires JWT authentication                                                     | <pre>{<br /> name?:STRING,<br /> image?: IMAGE-FILE,<br />} |
| DELETE | /albums/:albumId | Deletes the album with the specified ID, requires JWT authentication                                                 | N/A                                                         |

### /songs

| Method | Route          | Description                                                                                                         | Schema (FormData)                                                                                             |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| POST   | /songs         | Creates a new song, requires JWT authenticaiton                                                                     | <pre>{<br /> name: STRING,<br /> AlbumId: NUMBER,<br /> position: NUMBER,<br /> audio: AUDIO-FILE,<br />}     |
| GET    | /songs         | Returns all songs. Optional query param "name" and "limit" to search by name or limit returned results respectively | N/A                                                                                                           |
| GET    | /songs/:songId | Returns song with the specified ID                                                                                  | N/A                                                                                                           |
| PATCH  | /songs/:songId | Updates song with the specified ID, requires JWT authentication                                                     | <pre>{<br /> name?: STRING,<br /> AlbumId?: NUMBER,<br /> position?: NUMBER,<br /> audio?: AUDIO-FILE,<br />} |
| DELETE | /songs/:songId | Deletes the song with the specified ID, requires JWT authentication                                                 | N/A                                                                                                           |

## Attribution

Created by **Perry Baran** and **Nicola Giannotta**.
