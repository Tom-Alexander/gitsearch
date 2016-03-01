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
        format.formatFile({
          0: {content: 'foo', line_number: 1},
          1: {content: 'bar', line_number: 2},
          2: {content: 'baz', line_number: 3}
        }), [
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

  describe('arrayWindow', () => {

    it('returns even neighbors when no overflow', () => {
      assert.deepEqual(
        format.arrayWindow([
          {index: 0, content: 'foo'},
          {index: 1, content: 'bar'},
          {index: 2, content: 'baz'},
          {index: 3, content: 'hello'},
          {index: 4, content: 'world'}
        ],
          {index: 2, content: 'baz'},
          'baz', 1),
        {
          1: {line_number: 2, content: 'bar', extra: ''},
          2: {line_number: 3, content: '<span class="match">baz</span>', extra: ''},
          3: {line_number: 4, content: 'hello', extra: ''},
        }
      );
    });

    it('returns right weighted neighbors when lower bound overflow', () => {
      assert.deepEqual(
        format.arrayWindow([
          {index: 0, content: 'foo'},
          {index: 1, content: 'bar'},
          {index: 2, content: 'baz'},
          {index: 3, content: 'hello'},
          {index: 4, content: 'world'}
        ],
          {index: 0, content: 'foo'},
          'foo', 1),
        {
          0: {line_number: 1, content: '<span class="match">foo</span>', extra: ''},
          1: {line_number: 2, content: 'bar', extra: ''},
          2: {line_number: 3, content: 'baz', extra: ''},
        }
      );
    });

    it('returns left weighted neighbors when upper bound overflow', () => {
      assert.deepEqual(
        format.arrayWindow([
          {index: 0, content: 'foo'},
          {index: 1, content: 'bar'},
          {index: 2, content: 'baz'},
          {index: 3, content: 'hello'},
          {index: 4, content: 'world'}
        ],
          {index: 4, content: 'world'},
          'world', 1),
        {
          2: {line_number: 3, content: 'baz', extra: ''},
          3: {line_number: 4, content: 'hello', extra: ''},
          4: {line_number: 5, content: '<span class="match">world</span>', extra: ''}
        }
      );
    });

  });

  describe('highlightFile', () => {

    it('highlight multiple discontinuous matches', () => {
      assert.deepEqual(
        format.highlightFile(
          'foo\na\nb\nc\nd\ne\nf\ng\nh\ni\nfoo\nj\nk\nl\nm\n',
          'foo',
          1),
        [
          {content: '<span class=\"match\">foo</span>', extra: '', line_number: 1},
          {content: 'a', extra: '', line_number: 2},
          {content: 'b', extra: '', line_number: 3},
          {content: '', extra: 'divider', line_number: '...'},
          {content: 'i', extra: '', line_number: 10},
          {content: '<span class=\"match\">foo</span>', extra: '', line_number: 11},
          {content: 'j', extra: '', line_number: 12},
        ]
      );
    });

    it('highlight correctly with one line', () => {
      assert.deepEqual(
        format.highlightFile(
          'foo',
          'foo',
          2),
        [
          {content: '<span class=\"match\">foo</span>', extra: '', line_number: 1},
        ]
      );
    });

    it('highlight multiple continuous matches', () => {
      assert.deepEqual(
        format.highlightFile(
          'it(\'reflects an array of strings\', () => {\n' +
          'expect(reflect([\'foo\', \'bar\', \'baz\'])).to.be.deep.equal({\n' +
          'foo: \'foo\', bar: \'bar\', baz: \'baz\'\n});\n});\n\n' +
          'it(\'reflects an array of numbers\', () => {\n',
          'foo',
          2),
        [
          {content: 'it(&#39;reflects an array of strings&#39;, () =&gt; {', extra: '', line_number: 1},
          {content: 'expect(reflect([&#39;<span class=\"match\">foo</span>&#39;, &#39;bar&#39;, &#39;baz&#39;])).to.be.deep.equal({', extra: '', line_number: 2},
          {content: '<span class=\"match\">foo</span>: &#39;<span class=\"match\">foo</span>&#39;, bar: &#39;bar&#39;, baz: &#39;baz&#39;', extra: '', line_number: 3},
          {content: '});', extra: '', line_number: 4},
          {content: '});', extra: '', line_number: 5},
          {content: '', extra: '', line_number: 6},
        ]
      );
    });
  });

});
