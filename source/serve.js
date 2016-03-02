const path = require('path');
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
  app.engine('handlebars', exphbs({
    defaultLayout:  path.join(__dirname, 'views', 'layouts', 'main'),
    layout: false
  }));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'handlebars');
  app.listen(port);
  const search = searcher(host, index);

  app.get('/', (request, response) => {
      const refFilter = new Filter();
      const fileFilter = new Filter();
      const query = request.query || {};
      const page = query.page ? query.page : 1;
      const start = ((page - 1) * RESULTS_PER_PAGE);
      const content = query.query ? query.query : null;
      const reference = query.reference ? query.reference : 'master';
      search('ref',
          refFilter.filter('term', 'shorthand', reference).build()
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
              const term = content ? content : '';
              const length = Math.ceil(data.hits.total / RESULTS_PER_PAGE);
              const results = content ? data.hits.hits
                  .filter(hit => !!hit._source.content)
                  .map(hit => ({
                  summary: format.highlightFile(hit._source.content, term, 1),
                  name: hit._source.path,
                  type: hit._source.type,
                  reference: hit._source.references[0],
                  repository: hit._source.repository
              })) : [];
              response.render('home', {
                  page: page,
                  pages: length,
                  query: content,
                  results: results,
                  reference: reference,
                  repository: query.repository,
                  previousPage: page - 1 > 0 ? page - 1 : null,
                  nextPage: page + 1 < length ? page + 1 : null,
                  pagination: createArray(length),
                  helpers: { equal: equals }
              });
          }).catch(e => console.log(e))
      });
  });

  return app;

}

module.exports = serve;
module.exports.equals = equals;
module.exports.searcher = searcher;
module.exports.createArray = createArray;
