# code-search

This is a service for indexing and searching a git repository. Provides github
and bitbucket web hooks for automatic indexing.

## Installing

Install ('https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html')[elasticsearch], then:

```
npm install code-search -g
```

## Usage

## Hook server

```
code-search --hook
```

### Manual indexing:

```
code-search --local ../data/foo --type GITHUB --name data/foo --index repositories --host localhost:9200
```

## Configuration

### `--client`
Listens on port `5900` and waits for requests from `/bitbucket` and `/github`

### `--hook`
Listens on port `5900` and waits for requests from `/bitbucket` and `/github`

### `--local <path>`
Uses a local repository as the source.

### `--remote <path>`
Uses a remote repository as the source. Clones the repository to a temporary directory.

### `--host <name>`
Elasticsearch host

### `--index <name>`
Elasticsearch index

### `--type <type>`
This can be any string, but using `GITHUB` or `BITBUCKET` will correctly
handle URLs on the search results.

### `--name <name>`
Name of the repository.
