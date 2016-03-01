const elasticsearch = require('elasticsearch');
const exec = require( 'child_process' ).exec;
const minimatch = require('minimatch');
const Promise = require('bluebird');
const crypto = require('crypto');
const Git = require("nodegit");
const mime = require('mime');
const fpath = require('path');
const os = require('os');

const tmp = Promise.promisify(require('tmp').dir);
const fread = Promise.promisify(require('fs').readFile);

/**
 * returns the extension from a file name, excluding the dot
 * @param  {String} name
 * @return {String}
 */
function getExtension(name) {
    const extension = fpath.extname(name).split('.');
    return extension[extension.length - 1];
}

/**
 * Generates an array of glob patterns that should be ignored from the index
 * from the repository ignore file and the default ignore patterns
 * @param  {NodeGit.Repository} repository
 * @return {Promise}
 */
function ignoreList(repository) {
    return fread('./.gitsearchignore', 'utf8')
        .catch(file => '')
        .then(file => file.split('\n'))
        .catch(() => [])
        .then(local => repository.getMasterCommit()
            .then(commit => commit.getEntry('.gitsearchignore'))
            .then(entry => entry.getBlob())
            .then(blob => blob.content())
            .then(buffer => buffer.toString('utf8'))
            .then(file => file.split('\n'))
            .catch(() => [])
            .then(remote => local.concat(remote))
        ).catch(() => [])
}

/**
 * Creates an object holding every document in the repository, with its
 * corresponding reference relationships
 * @param  {Object} documents
 * @param  {NodeGit.Blob} blob
 * @param  {NodeGit.TreeEntry} entry
 * @param  {String[]} ignores
 * @param  {NodeGit.Reference} ref
 * @param  {String} name
 * @param  {String} type
 * @return {Promise}
 */
function reduceDocuments(documents, blob, entry, ignores, ref, name, type) {
    var path = entry.path();
    var sha = entry.sha();

    const ignore = ignores.reduce((p, v) => p || minimatch(path, v), false);

    if(!blob.isBinary() && !ignore) {
        var reference = ref.target().toString();
        if (documents[sha]) {
            documents[sha].references.push(reference);
        }
        else {
            var buffer = blob.content();
            documents[sha] = {
                id: sha,
                path: path,
                type: type,
                repository: name,
                references: [reference],
                file_type: mime.lookup(path),
                extension: getExtension(path),
                content: buffer.toString('utf8')
            };

        }
    }
}

/**
 * Reduces all the blobs that are descend from of each NodeGit.Reference tree
 * @param  {NodeGit.Reference[]} references
 * @param  {String} name
 * @param  {String} type
 * @param  {String[]} ignores
 * @return {Promise}
 */
function fromReferences(references, name, type, ignores) {
    var documents = {};
    return Promise.map(references, reference => {
        return Git.Commit
            .lookup(reference.repo, reference.target())
            .then(commit => commit.getTree())
            .then(tree => {
                return new Promise((resolve, reject) => {
                    const walker = tree.walk();
                    walker.on('entry', entry => {
                        if(entry.isBlob()) {
                            entry.getBlob().then(
                                blob => reduceDocuments(
                                    documents,
                                    blob,
                                    entry,
                                    ignores,
                                    reference,
                                    name,
                                    type
                                )
                            )
                        }
                    });
                    walker.on('end', resolve);
                    walker.on('error', reject);
                    walker.start();
                });
            })
    }).then(() => documents);
}

/**
 * Creates a reference document for indexing from a NodeGit Reference object
 * @param  {NodeGit.Reference} reference
 * @param  {String} rname
 * @return {Object}
 */
function createReferenceDocument(reference, rname) {
    const name = reference.name();
    const id = crypto.createHash('md5').update(name + rname).digest('hex');
    return {
        id: id,
        name: name,
        repository: rname,
        shorthand: reference.shorthand(),
        oid: reference.target().toString()
    };
}

/**
 * Creates a elasticsearch client and returns a function that can add an index
 * to the database.
 * @param  {String} host
 * @param  {String} indexName
 * @return {Function}
 */
function indexer(host, indexName) {
    const client = new elasticsearch.Client({ host: host });
    return (id, type, body) => new Promise((resolve, reject) => {
        client.index({
            id: id,
            type: type,
            body: body,
            index: indexName
        }, (error, response) => {
            if (error) return reject(error);
            else return resolve(response);
        });
    })
}

/**
 * Indexes a repository from a NodeGit Repository
 * @param  {String} name
 * @param  {NodeGit.Repository} source
 * @param  {Function} index
 * @return {Promise}
 */
function indexFromRepository(name, type, source, index) {
    return ignoreList(source).then(ignores =>
        source.getReferences(Git.Reference.TYPE.OID)
            .then(refs => fromReferences(refs, name, type, ignores)
                .then(files => Object.keys(files).map(v => files[v]))
                .then(files => Promise.all([
                    Promise.map(files, file => index(file.id, 'file', file)),
                    Promise.mapSeries(refs, ref => createReferenceDocument(ref, name)).then(
                        docs => Promise.map(
                            docs,
                            doc => index(doc.id, 'ref', doc)))
                ]))
        )
    );
}


/**
 * Indexes a repository from a directory
 * @param  {String} path
 * @param  {String} name
 * @param  {Function} index
 * @return {Promise}
 */
function indexFromPath(path, type, name, index) {
    return Git.Repository.open(path)
        .then(repository => indexFromRepository(
            name,
            type,
            repository,
            index
        )
    );
}

/**
 * Indexes a repository from a remote address, clones into a temporary directory
 * @param  {String} url
 * @param  {String} name
 * @param  {Function} index
 * @return {Promise}
 */
function indexFromURL(url, type, name, index) {
    return tmp().then(
        directory => Git.Clone(url, directory)
            .then(repository => indexFromRepository(
                name,
                type,
                repository,
                index
            )));
}

module.exports.indexer = indexer;
module.exports.ignoreList = ignoreList;
module.exports.getExtension = getExtension;
module.exports.indexFromURL = indexFromURL;
module.exports.indexFromPath = indexFromPath;
module.exports.fromReferences = fromReferences;
module.exports.reduceDocuments = reduceDocuments;
module.exports.indexFromRepository = indexFromRepository;
module.exports.createReferenceDocument = createReferenceDocument;
