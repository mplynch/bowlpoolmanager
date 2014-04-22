'use strict';

/* Filters */

angular.module('myApp.filters', [])
    .filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }])

    .filter('reverse', function () {
        function toArray(list) {
            var k, out = [];
            if (list) {
                if (angular.isArray(list)) {
                    out = list;
                }
                else if (typeof(list) === 'object') {
                    for (k in list) {
                        if (list.hasOwnProperty(k)) {
                            out.push(list[k]);
                        }
                    }
                }
            }
            return out;
        }

        return function (items) {
            return toArray(items).slice().reverse();
        };
    })

    .filter('inArrayMatchByField', function () {
        return function inArray(haystack, needle, field) {
            var result = [];
            var item, i;
            for (i = 0; i < haystack.length; i++) {
                item = haystack[i];
                var fieldValue = item[field];
                if (needle[fieldValue])
                    result.push(item);
            }

            return (result);
        };
    });
