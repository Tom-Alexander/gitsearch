
function github(payload) {
    return {
        url: payload.clone_url,
        name: payload.full_name,
        type: 'GITHUB',
        link: function (entry) {
            var link = 'https://github.com/';
            link += entry.repository;
            link += '/blob/' + entry.branchName;
            link +=  '/' + entry.path;
            link += entry.lineNumber ? link + '#' + entry.lineNumber : '';
            return link;
        }
    };
}

function bitbucket(payload) {
    return {
        name: payload.repository.full_name,
        url: 'https://bitbucket.org/' + payload.repository.full_name + '.git',
        type: 'BITBUCKET',
        link: function (entry) {
            var link = 'https://bitbucket.org/';
            link += entry.repository;
            link += '/src/' + entry.branchId;
            link +=  '/' + entry.path + '?fileviewer=file-view-default';
            link += entry.lineNumber ? link + '#-' + entry.lineNumber : '';
            return link;
        }
    };
}

module.exports.github = github;
module.exports.bitbucket = bitbucket;
