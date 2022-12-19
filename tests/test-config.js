const sinon = require('sinon');
const auth = require('../src/middleware/auth');

const authStub = sinon.stub(auth, 'authenticateToken');

// app has to be called after stubbing middleware
const app = require('../src/app');

module.exports = { authStub, app };
