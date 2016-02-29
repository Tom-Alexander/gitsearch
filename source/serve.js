const Filter = require('./Filter');
const format = require('./format');
const express = require('express');
const Promise = require('bluebird');
const exphbs  = require('express-handlebars');
const elasticsearch = require('elasticsearch');

const RESULTS_PER_PAGE = 10;

function searcher(host, indexName) {
    const client = new elasticsearch.Client({ host: host });
    return (type, body) => new Promise((resolve, reject) => {
        client.search({
            body: body,
            type: type,
            index: indexName
        }, (error, response) => {
            console.log(body);
            if (error) return reject(error);
            else return resolve(response);
        });
    })
}

function createArray(len) {
    var res = [];
    for (var i = 0; i < len; i++) res[i] = i + 1;
    return res;
}

function equals(left, right, options) {
    return left === right ? options.fn(this) : options.inverse(this);
}

function serve(host, index, port) {
  const app = express();
  app.listen(port);
  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
  const search = searcher(host, index);
  app.get('/', (request, response) => {
      const refFilter = new Filter();
      const fileFilter = new Filter();
      const query = request.query || {};
      const branch = 'master';
      const content = query.query ? query.query : null;
      const page = query.page ? query.page : 1;
      const start = ((page - 1) * RESULTS_PER_PAGE);
      search('ref',
          refFilter.filter('term', 'shorthand', branch).build()
      ).then(refs => refs.hits.hits.map(hit => hit._source.oid))
      .then(refs => {
          return search('file', fileFilter.query('match', 'content', content)
              .filter('term', 'path', query.path)
              .filter('term', 'type', query.type)
              .filter('term', 'repository',query.repository)
              .filter('term', 'file_type', query.file_type)
              .filter('term', 'extension', query.extension)
              .filter('terms', 'references', refs)
              .size(RESULTS_PER_PAGE)
              .from(start)
              .build()
          ).then(data => {
              const length = Math.ceil(data.hits.total / RESULTS_PER_PAGE);
              const results = data.hits.hits
                  .filter(hit => !!hit._source.content)
                  .map(hit => ({
                  summary: format.highlightFile(hit._source.content, content, 1),
                  name: hit._source.path,
                  type: hit._source.type,
                  reference: hit._source.references[0],
                  repository: hit._source.repository
              }));
              response.render('home', {
                  page: page,
                  query: content,
                  branch: branch,
                  results: results,
                  repository: query.repository,
                  pagination: createArray(length),
                  helpers: { equal: equals }
              });
          }).catch(e => console.log(e))
      });
  });
}

module.exports = serve;
module.exports.equals = equals;
module.exports.searcher = searcher;
module.exports.createArray = createArray;
