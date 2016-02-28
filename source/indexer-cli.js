const minimist = require('minimist');
const indexer = require('./indexer');
const args = minimist(process.argv.slice(2));

function action(key, path) {
    return indexer[key].apply(null, [
        path,
        args.type,
        args.name,
        indexer.indexer(args.host, args.index)
    ]);
}

function run() {

    if (!args.name || !args.index || !args.host || !args.type) {
        console.error('Invalid number of parameters');
        return null;
    }

    if (args.remote) return action('indexFromURL', args.remote);
    if (args.local) return action('indexFromPath', args.local);
    console.error('Invalid number of parameters');
}

run();
