const bodyParser = require('body-parser');
const express = require('express');
const Promise = require('bluebird');
const basic = require('basic-auth');
const crypto = require('crypto');

function auth(name, password) {
  return (request, response, next) => {
    const user = basic(request);
    const exists = name !== undefined && password !== undefined;
    const correct = user && user.name === name && user.pass === password;
    if (!exists || correct) return next();
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return response.sendStatus(401);
  }
}

function hash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

const transformers = {

  GITHUB: request => ({
    type: 'GITHUB',
    url: request.body.repository.url,
    name: request.body.repository.full_name
  }),

  BITBUCKET: request => ({
    type: 'BITBUCKET',
    name: request.body.repository.full_name,
    url: 'https://bitbucket.org/' + request.body.repository.full_name + '.git'
  })

};

function watch(port, user, password, index) {

  var queue = [];
  const path = '/queue';
  const app = express();
  app.listen(port);
  app.use(auth(user, password));
  app.use(bodyParser.json());

  app.get(path, (request, response) => response.send(queue));

  app.delete(path, (request, response) => {
      Promise.map(queue, item => index(item))
      .all()
      .then(() => queue = [])
      .then(() => response.send(queue));
  });

  app.post(path, (request, response) => {
    const transformer = transformers[request.query.type];
    if (transformer) {
      const repository = transformer(request);
      const id = hash(repository.url);
      queue[id] = repository;
      return response.send({ id: id });
    }
  });

  return app;

}

module.exports = watch;
module.exports.auth = auth;
module.exports.hash = hash;
module.exports.transformers = transformers;
