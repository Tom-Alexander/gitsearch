const assert = require('assert');
const format = require('../source/format.js');

describe('format', () => {

  describe('replaceAll', () => {

    it('replaces all instances of a non-empty string', () => {
      assert.equal(
        format.replaceAll('foo bar baz foo', 'foo', 'baz'),
        'baz bar baz baz'
      );
    });

    it('does nothing to an empty string', () => {
      assert.equal(
        format.replaceAll('', 'foo', 'baz'),
        ''
      );
    });

  });

  describe('formatLine', () => {

    it('formats a line with matches', () => {
      assert.equal(
        format.formatLine('foo bar baz foo', 'foo'),
        '<span class="match">foo</span> bar baz <span class="match">foo</span>'
      );
    });

    it('formats a line with special characters', () => {
      assert.equal(
        format.formatLine('foo <div>bar baz foo<div>', 'foo'),
        '<span class="match">foo</span> &lt;div&gt;bar baz <span class="match">foo</span>&lt;div&gt;'
      );
    });

    it('formats a line without matches', () => {
      assert.equal(
        format.formatLine('bar baz', 'foo'),
        'bar baz'
      );
    });

  });

  describe('formatFile', () => {

    it('formats a file without matches', () => {
      assert.deepEqual(
        format.formatFile({}),
        []
      );
    });

    it('formats a file with ordered continuous matches', () => {
      assert.deepEqual(
        format.formatFile({0: {content: 'foo', line_number: 1}, 1: {content: 'bar', line_number: 2}, 2: {content: 'baz', line_number: 3}}),
        [
          {content: 'foo', line_number: 1},
          {content: 'bar', line_number: 2},
          {content: 'baz', line_number: 3}
        ]
      );
    });

    it('formats a file with ordered discontinuous matches', () => {
      assert.deepEqual(
        format.formatFile({
          0: {content: 'foo', line_number: 1},
          1: {content: 'bar', line_number: 10},
          2: {content: 'baz', line_number: 11}
        }), [
          {content: 'foo', line_number: 1},
          {content: '', line_number: '...', extra: 'divider'},
          {content: 'bar', line_number: 10},
          {content: 'baz', line_number: 11}
        ]
      );
    });

  });

  // describe('arrayWindow', () => {
  //   it('', () => {
  //     assert.equal(
  //       format.arrayWindow([], line, term, 2),
  //       {}
  //     );
  //   });
  //
  // });

});
