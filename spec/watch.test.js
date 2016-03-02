const sinon = require('sinon');
const assert = require('assert');
const request = require('supertest');
const watch = require('../source/watch.js');

describe('watch', () => {

  const mock = sinon.mock();
  var app = watch(5900, 'foo', 'bar', mock);

  describe('POST /queue?type=GITHUB', () => {

    it('Auth Failure', done => {
      request(app)
      .post('/queue?type=GITHUB')
      .send()
      .expect(401)
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });

    it('indexes the repository on a github event', done => {
      const id = watch.hash('git@github.com:foo/bar.git');
      request(app)
      .post('/queue?type=GITHUB')
      .auth('foo', 'bar')
      .send({
        commits: [],
        head_commit: {},
        repository: {
          full_name: 'foo/bar'
        }
      })
      .expect(200)
      .expect(response => {
        if(response.body.id !== id) throw new Error('Incorrect id');
      })
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });
  });

  describe('POST /queue?type=BITBUCKET', () => {

    it('indexes the repository on a bitbucket event', done => {
      const id = watch.hash('git@bitbucket.org:foo/bar.git');
      request(app)
      .post('/queue?type=BITBUCKET')
      .auth('foo', 'bar')
      .send({
        repository: {
          links: {},
          uuid: "{673a6070-3421-46c9-9d48-90745f7bfe8e}",
          full_name: "foo/bar",
          name: "repo_name",
          scm: "git",
          is_private: true
        },
      })
      .expect(200)
      .expect(response => {
        if(response.body.id !== id) throw new Error('Incorrect id');
      })
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });

    it('Auth Failure', done => {
      request(app)
      .post('/queue?type=BITBUCKET')
      .send()
      .expect(401)
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });

  });

  describe('GET /queue', () => {

    it('gets the entire queue', done => {
      request(app)
      .get('/queue')
      .auth('foo', 'bar')
      .send()
      .expect(200)
      .expect(response => {
        if(response.body.length !== 0) throw new Error('Bad queue response');
      })
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });

    it('Auth Failure', done => {
      request(app)
      .get('/queue')
      .send()
      .expect(401)
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });

  });

  describe('DELETE /queue', () => {
    it('Auth Failure', done => {
      request(app)
      .get('/queue')
      .send()
      .expect(401)
      .end((error, response) => {
        if (error) return done(error);
        done();
      });
    });
  });

});
