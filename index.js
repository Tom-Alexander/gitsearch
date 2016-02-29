const indexer = require('./source/indexer');
const serve = require('./source/serve');
const watch = require('./source/watch');

module.exports.indexFromURL = indexer.indexFromURL;
module.exports.indexFromPath = indexer.indexFromPath;
module.exports.indexFromRepository = indexer.indexFromRepository;

module.exports.serve = serve;
module.exports.watch = watch;
