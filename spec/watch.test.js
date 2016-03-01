const sinon = require('sinon');
const request = require('supertest');
const watch = require('../source/watch.js');

describe('watch', () => {

  describe('POST /github', () => {
    it('indexes the repository on a github event', done => {
      const mock = sinon.mock();
      var app = watch(5900, 'foo', 'bar', mock);
      request(app)
      .post('/github')
      .expect(200)
      .send({
        commits: [],
        head_commit: {},
        repository: {
          id: 35129377,
          name: "public-repo",
          full_name: "baxterthehacker/public-repo",
          owner: {},
          private: false,
          description: "",
          fork: false,
          url: "https://github.com/baxterthehacker/public-repo",
        }
      }).end(function(err, res){
        app.close();
        if (err) return done(err);
        done();
      });
    });
  });

  describe('POST /bitbucket', () => {
    it('indexes the repository on a bitbucket event', done => {
      const mock = sinon.mock();
      const app = watch(5900, 'foo', 'bar', mock);
      request(app)
      .post('/bitbucket')
      .send()
      .expect(200)
      .end(function(err, res){
        app.close();
        if (err) return done(err);
        done();
      });
    });
  });

});
