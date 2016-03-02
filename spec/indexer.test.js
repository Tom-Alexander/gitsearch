const path = require('path');
const sinon = require('sinon');
const indexer = require('../source/indexer.js');
const repoPath = path.resolve(__dirname, './data');

describe('indexer', () => {
  describe('indexFromPath', () => {
    it('indexes a repository from a path', done => {
      const fakeIndexer = sinon.mock().exactly(8);
      indexer.indexFromPath(
        repoPath,
        'GITHUB',
        'spec/data',
        fakeIndexer
      ).then(() => {
        fakeIndexer.verify();
        done();
      }).catch(error => done(error));
    });
  });
});
