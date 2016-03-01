const express = require('express');
const Promise = require('bluebird');
const basic = require('basic-auth');

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

function watch(port, user, password, indexFromURL) {

  const app = express();
  app.listen(port);
  const post = (path, fn) => app.post(path, auth(user, password), fn);

  post('/github', (request, response) => {
    console.log(request);
    return indexFromURL(
      request.body.clone_url,
      'GITHUB',
      request.body.full_name
    ).then(() => res.status(200));
  });

  post('/bitbucket', (request, response) => {
    return indexFromURL(
      'https://bitbucket.org/' + request.body.repository.full_name + '.git',
      'BITBUCKET',
      request.body.repository.full_name
    ).then(() => res.status(200));
  });

  return app;

}

module.exports = watch;
