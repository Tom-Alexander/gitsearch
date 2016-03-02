#!/usr/bin/env node

const indexer = require('./indexer');
const process = require('process');
const serve = require('./serve');
const watch = require('./watch');
const yargs = require('yargs');
const path = require('path');

yargs.command('index', 'indexes a git repository', (yargs) => {
  return yargs.command('remote', 'indexes a remote repository', yargs => {
    return yargs.option('host', { describe: 'elasticsearch host', default: 'localhost:9200' })
    .option('name', { describe: 'name of the repository' })
    .option('url', { describe: 'URL to repository' })
    .option('index', { describe: 'elasticsearch index', default: 'repositories' })
    .option('type', { describe: 'type of repository', choices: ['GITHUB', 'BITBUCKET'] })
    .demand(['host', 'name', 'index', 'type', 'url'])
  }).command('local', 'indexes a local repository', yargs => {
    return yargs.option('host', { describe: 'elasticsearch host', default: 'localhost:9200' })
    .option('name', { describe: 'name of the repository' })
    .option('path', { describe: 'path to repository' })
    .option('index', { describe: 'elasticsearch index', default: 'repositories' })
    .option('type', { describe: 'type of repository', choices: ['GITHUB', 'BITBUCKET'] })
    .demand(['host', 'name', 'index'])
  })
});

yargs.command('serve', 'Serves the client application', (yargs) => {
  return yargs
    .option('host', { describe: 'elasticsearch host', default: 'localhost:9200' })
    .option('index', { describe: 'elasticsearch index', default: 'repositories' })
    .option('port', { describe: 'client server port', default: 5900 })
    .option('user', { describe: 'basic auth username' })
    .option('pass', { describe: 'basic auth password' })
    .demand(['host', 'index', 'port']);
    return args;
});

yargs.command('watch', 'Watches the hooks for repositories', (yargs) => {
  return yargs
    .option('host', { describe: 'elasticsearch host', default: 'localhost:9200' })
    .option('index', { describe: 'elasticsearch index', default: 'repositories' })
    .option('port', { describe: 'hook server port', default: 5860 })
    .demand(['host', 'index', 'port'])
});

const actions = {

  index: args => {
    return actions[args._[1]];
  },

  local: args => {
    return indexer.indexFromPath(
      path.resolve(path.join(process.cwd(), args.path)),
      args.type,
      args.name,
      indexer.indexer(args.host, args.index)
    );
  },

  remote: args => {
    return indexer.indexFromURL(
      args.url,
      args.type,
      args.name,
      indexer.indexer(args.host, args.index)
    );
  },

  serve: args => {
    return serve(
      args.host,
      args.index,
      args.port
    );
  },

  watch: args => {
    return watch(
      args.port,
      args.user,
      args.pass,
      (url, type, name) => indexer.indexFromURL(
        url,
        type,
        name,
        indexer.indexer(args.host, args.index)
      )
    );
  }

};

main(yargs.help().argv);

function main(args) {
  if (args._.length) {
    if(actions[args._[0]]) {
      return actions[args._[0]](args);
    }
  }
}
