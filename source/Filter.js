'use strict';
const Bodybuilder = require('bodybuilder');

class Filter extends Bodybuilder {

    query(queryType, fieldToQuery, searchTerm) {
        if (searchTerm) return super.query(queryType, fieldToQuery, searchTerm);
        return this;
    }

    filter(queryType, fieldToQuery, searchTerm) {
        if (searchTerm) return super.query(queryType, fieldToQuery, searchTerm);
        return this;
    }
}

module.exports = Filter;
