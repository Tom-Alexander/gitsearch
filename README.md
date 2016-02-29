# Gitsearch

This is a service for indexing and searching git repositories. Provides github
and bitbucket web hooks for automatic indexing. Allows searching within branches/tags across repositories.

## Installing

Make sure your have [elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html) Installed, then install gitsearch with:

```
npm install gitsearch -g
```
## Usage
### Indexing
#### `gitsearch index remote`
Indexes a git repository from a remote machine.

#### `gitsearch index local`
Indexes a git repository from your local machine.

### Serve
#### `gitsearch serve`
Starts the client application for searching.

### Watch
#### `gitsearch watch`
Starts the client application for watching github and bitbucket webhooks.

### Arguments

##### `--url <string>`
The path to the repository, for example `https://github.com/Tom-Alexander/gitsearch.git`. This argument is *required* for local repositories and is not set by default.

##### `--path <string>`
The path to the repository, for example `~/gitsearch`. This argument is *required* for local repositories and is not set by default.

##### `--name <string>`
The name of the repository, for example `Tom-Alexander/gitsearch`. This argument is *required* and is not set by default.

##### `--type <GITHUB|BITBUCKET>`
The type of repository, for example `GITHUB`. This argument is *optional* and is not set by default.

##### `--host <string>`
The elasticsearch host, for example `localhost:9200`. This argument is *required* but `localhost:9200` will used by default.

##### `--index <string>`
The elasticsearch index, for example `repositories`. This argument is *required* but `repositories` will used by default.

##### `--port <integer>`
The port for the server to listen to, for example `5900`. This argument is *optional*  for `serve` and `watch`.

##### `--user <integer>`
The username for the basic auth credentials. This argument is *optional*  for `watch`.

##### `--pass <integer>`
The password for the basic auth credentials. This argument is *optional*  for `watch`.

## Ignoring files
The indexer will look for glob path patterns in a file named `.gitsearchignore` in the `master` branch for your repository. Paths that match these patterns will be ignored, along with the patterns in the  `.gitsearchignore` file in this library.

## API
#### `indexFromURL(url, type, name, index)`
#### `indexFromPath(path, type, name, index)`
#### `indexFromRepository(name, type, source, index)`

## License
The MIT License (MIT)

Copyright (c) Tom Alexander

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
