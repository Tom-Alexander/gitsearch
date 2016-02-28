'use strict';
const escapeHTML = require('escape-html');

function replaceAll(string, a, b, ignore) {
    return string.replace(
        new RegExp(
            a.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'),
            ignore ? 'gi' : 'g'
        ),
        typeof(str2) === 'string' ? b.replace(/\$/g, '$$$$') : b
    );
}

function formatLine(content, term) {
  return replaceAll(
      escapeHTML(content),
      term,
      `<span class="match">${term}</span>`
  );
}

function formatFile(object) {
  const lines = Object.keys(object).map(k => object[k]);
  return lines.reduce((acc, line, i) => {
    const next = lines[i+1];
    const hasNext = next !== undefined;
    const continuous = hasNext && line.line_number + 1 === next.line_number;
    return !hasNext || continuous ? acc.concat([line]) : acc.concat([line, {
      content: '',
      index: null,
      extra: 'divider',
      line_number: '...'
  }]);
  }, []);
}

function arrayWindow(array, line, term, buffer) {
  const index = line.index;
  const length = array.length;
  const l_end = index + buffer;
  const l_start = index - buffer;
  const u_end = index + (2 * buffer);
  const u_start = index - (2 * buffer);
  let end = l_start < 0 ? u_end : l_end;
  let start = l_end < (length - 1) ? u_start : l_start;
  start = start < 0 ? 0 : start;
  end = end > (length - 1) ? (length - 1) : end;
  const segment = array.slice(start, end);
  return segment.reduce(
      (a, v) => Object.assign(a, {
          [v.index]: {
              line_number: v.index + 1,
              extra: '',
              content: formatLine(v.content, term)
          }}), {}
      );
}

function highlightFile(file, term, buffer) {
  const lines = file.split('\n').map((v, i) => ({index: i, content: v}));
  return formatFile(lines.filter(line => line.content.indexOf(term) > -1)
    .map(line => arrayWindow(lines, line, term, buffer))
    .reduce((acc, line) => Object.assign(acc, line), {}));
}

module.exports.formatFile = formatFile;
module.exports.formatLine = formatLine;
module.exports.replaceAll = replaceAll;
module.exports.arrayWindow = arrayWindow;
module.exports.highlightFile = highlightFile;
