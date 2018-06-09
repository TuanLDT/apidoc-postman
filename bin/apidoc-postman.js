#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var pathToRegexp = _interopDefault(require('path-to-regexp'));
var upperCase = _interopDefault(require('upper-case'));
var tableify = _interopDefault(require('html-tableify'));
var apidoc = _interopDefault(require('apidoc-core'));
var winston = require('winston');
var markdown = _interopDefault(require('marked'));
var fs$1 = _interopDefault(require('fs-extra'));
var nomnom = _interopDefault(require('nomnom'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var PackageInfo = function () {
    function PackageInfo(app) {
        classCallCheck(this, PackageInfo);

        this.app = app;
    }

    PackageInfo.prototype.get = function get$$1() {
        var app = this.app;
        var result = {};

        // Read package.json
        var packageJson = this._readPackageData('package.json');

        if (packageJson.apidoc) result = packageJson.apidoc;

        result = _.defaults({}, result, {
            name: packageJson.name || '',
            version: packageJson.version || '0.0.0',
            description: packageJson.description || ''
        });

        // read apidoc.json (and overwrite package.json information)
        var apidocJson = this._readPackageData('apidoc.json');

        // apidoc.json has higher priority
        _.extend(result, apidocJson);

        // options.packageInfo overwrites packageInfo
        _.extend(result, app.options.packageInfo);

        // replace header footer with file contents
        _.extend(result, this._getHeaderFooter(result));

        if (Object.keys(apidocJson).length === 0) app.log.warn('Please create an apidoc.json.');

        return result;
    };

    PackageInfo.prototype._readPackageData = function _readPackageData(filename) {
        var app = this.app;
        var result = {};
        var jsonFilename = path.join(app.options.src, filename);

        // read from source dir
        if (!fs.existsSync(jsonFilename)) {
            // read vom current dir
            jsonFilename = './' + filename;
        }
        if (!fs.existsSync(jsonFilename)) {
            app.log.debug(filename + ' not found!');
        } else {
            try {
                result = JSON.parse(fs.readFileSync(jsonFilename, 'utf8'));
                app.log.debug('read: ' + jsonFilename);
            } catch (e) {
                throw new Error('Can not read: ' + filename + ', please check the format (e.g. missing comma).');
            }
        }
        return result;
    };

    PackageInfo.prototype._getHeaderFooter = function _getHeaderFooter(json) {
        var app = this.app;
        var result = {};

        ['header', 'footer'].forEach(function (key) {
            if (json[key] && json[key].filename) {
                var filename = path.join(app.options.src, json[key].filename);
                if (!fs.existsSync(filename)) filename = path.join('./', json[key].filename);

                try {
                    app.log.debug('read header file: ' + filename);
                    var content = fs.readFileSync(filename, 'utf8');
                    result[key] = {
                        title: json[key].title,
                        content: app.markdown ? app.markdown(content) : content
                    };
                } catch (e) {
                    throw new Error('Can not read: ' + filename + '.');
                }
            }
        });

        return result;
    };

    return PackageInfo;
}();

var apiDoc = {};

var ParseAPIDoc = function () {
    function ParseAPIDoc() {
        classCallCheck(this, ParseAPIDoc);

        this._formatAPI = this._formatAPI.bind(this);
    }

    ParseAPIDoc.prototype.toPostman = function toPostman(apidocJson, projectJson) {
        apiDoc.info = this.addInfo(projectJson);
        apiDoc.item = this.addItem(apidocJson);
        return apiDoc;
    };

    ParseAPIDoc.prototype.addInfo = function addInfo(projectJson) {
        var info = {};
        info['name'] = projectJson.title || projectJson.name;
        info['schema'] = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
        return info;
    };

    ParseAPIDoc.prototype.addItem = function addItem(apidocJson) {
        var items = this._groupItemByGroup(apidocJson);
        return items;
    };

    ParseAPIDoc.prototype._groupItemByGroup = function _groupItemByGroup(apidocJson) {
        var self = this;
        var groups = _.groupBy(apidocJson, 'group');
        return _.map(groups, function (apisInGroup, key) {
            var item = _.map(apisInGroup, self._formatAPI);
            return {
                name: key,
                description: '',
                item: item
            };
        });
    };

    ParseAPIDoc.prototype._formatAPI = function _formatAPI(api) {
        var url = api.url;
        var pattern = pathToRegexp(url, null);
        var matches = pattern.exec(url);
        for (var j = 1; j < matches.length; j++) {
            var key = matches[j].substr(1);
            url = url.replace(matches[j], '{' + key + '}');
        }

        api.url = url;
        api.type = upperCase(api.type);
        return {
            name: api.title,
            request: {
                method: api.type,
                header: [{
                    key: 'Content-Type',
                    value: 'application/json'
                }, {
                    key: 'Accept',
                    value: 'application/json'
                }],
                url: {
                    raw: 'http://{{host}}' + url,
                    protocol: 'http',
                    host: ['{{host}}'],
                    path: url.split('/')
                },
                description: this._formatAPIDescription(api)
            }
        };
    };

    ParseAPIDoc.prototype._formatMethodColor = function _formatMethodColor(method) {
        var color = void 0;
        switch (method) {
            case 'GET':
                color = 'green';
                break;
            case 'POST':
                color = 'yellow';
                break;
            case 'PUT':
                color = 'blue';
                break;
            case 'DELETE':
                color = 'red';
        }
        return '<span style="color:' + color + '">' + method + '</span>';
    };

    ParseAPIDoc.prototype._formatParams = function _formatParams(api) {
        if (!api.parameter) {
            return '';
        }

        var params = api.parameter.fields.Parameter;
        params = _.map(params, function (param) {
            return _.omit(param, ['group']);
        });
        return '<br/>**Params:**\n' + (tableify(params) + '\n\n');
    };

    ParseAPIDoc.prototype._formatResponse = function _formatResponse(api) {
        if (!api.success) {
            return '';
        }

        var _api$success = api.success,
            examples = _api$success.examples,
            fields = _api$success.fields;


        var data = '';

        if (fields || examples && examples.length) {
            data += '<br/>**Response:**\n';
        }

        if (fields) {
            var responses = [];
            _.mapKeys(fields, function (params, key) {
                params = _.map(params, function (param) {
                    return _.omit(param, ['group']);
                });
                responses.push(' ***' + key + '***\n\n' + (tableify(params) + '\n\n'));
            });
            data += responses.join('\n\n') + '\n\n';
        }

        if (examples && examples.length) {
            data = data + '<br/>**Success response example:**\n\n' + '```json\n' + examples[0].content + '\n```';
        }

        return data;
    };

    ParseAPIDoc.prototype._formatAPIDescription = function _formatAPIDescription(api) {
        return '# ' + api.description + '\n\n\n\n' + ('**URL**: `' + api.url + '`\n\n') + ('**Method**: `' + api.type + '`\n\n') + ('' + this._formatParams(api)) + ('' + this._formatResponse(api));
    };

    return ParseAPIDoc;
}();

var parseAPIDoc = new ParseAPIDoc();

var defaults$1 = {
    dest: path.join(__dirname, '../doc/'),
    template: path.join(__dirname, '../template/'),

    debug: false,
    silent: false,
    verbose: false,
    simulate: false,
    parse: false, // only parse and return the data, no file creation
    colorize: true,
    markdown: true,

    marked: {
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: false,
        smartypants: false
    }
};

var app = {
    log: {},
    markdown: false,
    options: {}
};

// uncaughtException
process.on('uncaughtException', function (err) {
    console.error(new Date().toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});

function apidocToPostman(options) {
    var api;
    var apidocPath = path.join(__dirname, '../');
    var packageInfo;

    options = _.defaults({}, options, defaults$1);

    // paths
    options.dest = path.join(options.dest, './');

    // options
    app.options = options;

    // logger
    app.log = new winston.Logger({
        transports: [new winston.transports.Console({
            level: app.options.debug ? 'debug' : app.options.verbose ? 'verbose' : 'info',
            silent: app.options.silent,
            prettyPrint: true,
            colorize: app.options.colorize,
            timestamp: false
        })],
        exitOnError: false
    });

    // markdown
    if (app.options.markdown === true) {
        app.markdown = markdown;
        app.markdown.setOptions(app.options.marked);
    }

    try {
        packageInfo = new PackageInfo(app);

        // generator information
        var json = JSON.parse(fs$1.readFileSync(apidocPath + 'package.json', 'utf8'));
        apidoc.setGeneratorInfos({
            name: json.name,
            time: new Date(),
            url: json.homepage,
            version: json.version
        });
        apidoc.setLogger(app.log);
        apidoc.setMarkdownParser(app.markdown);
        apidoc.setPackageInfos(packageInfo.get());

        api = apidoc.parse(app.options);

        if (api === true) {
            app.log.info('Nothing to do.');
            return true;
        }
        if (api === false) return false;

        if (app.options.parse !== true) {
            var apidocData = JSON.parse(api.data);
            var projectData = JSON.parse(api.project);
            api['postmanData'] = JSON.stringify(parseAPIDoc.toPostman(apidocData, projectData));
            createOutputFile(api);
        }

        app.log.info('Done.');
        return api;
    } catch (e) {
        app.log.error(e.message);
        if (e.stack) app.log.debug(e.stack);
        return false;
    }
}

function createOutputFile(api) {
    if (app.options.simulate) app.log.warn('!!! Simulation !!! No file or dir will be copied or created.');

    app.log.verbose('create dir: ' + app.options.dest);
    if (!app.options.simulate) fs$1.mkdirsSync(app.options.dest);

    //Write swagger
    app.log.verbose('write postman json file: ' + app.options.dest + 'postman.json');
    if (!app.options.simulate) fs$1.writeFileSync(app.options.dest + './postman.json', api.postmanData);
}

var argv = nomnom.option('file-filters', { abbr: 'f', 'default': '.*\\.(clj|coffee|cs|dart|erl|go|java|js|php?|py|rb|ts|pm)$',
    help: 'RegEx-Filter to select files that should be parsed (multiple -f can be used).' }).option('exclude-filters', { abbr: 'e', 'default': '',
    help: 'RegEx-Filter to select files / dirs that should not be parsed (many -e can be used).' }).option('input', { abbr: 'i', 'default': './', help: 'Input / source dirname.' }).option('output', { abbr: 'o', 'default': './doc/', help: 'Output dirname.' }).option('verbose', { abbr: 'v', flag: true, 'default': false, help: 'Verbose debug output.' }).option('help', { abbr: 'h', flag: true, help: 'Show this help information.' }).option('debug', { flag: true, 'default': false, help: 'Show debug messages.' }).option('color', { flag: true, 'default': true, help: 'Turn off log color.' }).option('parse', { flag: true, 'default': false,
    help: 'Parse only the files and return the data, no file creation.' }).option('parse-filters', { help: 'Optional user defined filters. Format name=filename' }).option('parse-languages', { help: 'Optional user defined languages. Format name=filename' }).option('parse-parsers', { help: 'Optional user defined parsers. Format name=filename' }).option('parse-workers', { help: 'Optional user defined workers. Format name=filename' }).option('silent', { flag: true, 'default': false, help: 'Turn all output off.' }).option('simulate', { flag: true, 'default': false, help: 'Execute but not write any file.' })

// markdown settings
.option('markdown', { flag: true, 'default': true, help: 'Turn off markdown parser.' }).option('marked-config', { 'default': '',
    help: 'Enable custom markdown parser configs. It will overwite all other marked settings.' }).option('marked-gfm', { flag: true, 'default': true,
    help: 'Enable GitHub flavored markdown.' }).option('marked-tables', { flag: true, 'default': true,
    help: 'Enable GFM tables. This option requires the gfm option to be true.' }).option('marked-breaks', { flag: true, 'default': false,
    help: 'Enable GFM line breaks. This option requires the gfm option to be true.' }).option('marked-pedantic', { flag: true, 'default': false,
    help: 'Conform to obscure parts of markdown.pl as much as possible.' }).option('marked-sanitize', { flag: true, 'default': false,
    help: 'Sanitize the output. Ignore any HTML that has been input.' }).option('marked-smartLists', { flag: true, 'default': false,
    help: 'Use smarter list behavior than the original markdown.' }).option('marked-smartypants', { flag: true, 'default': false,
    help: 'Use \'smart\' typograhic punctuation for things like quotes and dashes.' }).parse();

/**
 * Transform parameters to object
 *
 * @param {String|String[]} filters
 * @returns {Object}
 */
function transformToObject(filters) {
    if (!filters) return;

    if (typeof filters === 'string') filters = [filters];

    var result = {};
    filters.forEach(function (filter) {
        var splits = filter.split('=');
        if (splits.length === 2) {
            result[splits[0]] = path.resolve(splits[1], '');
        }
    });
    return result;
}

/**
 * Sets configuration for markdown
 *
 * @param {Array} argv
 * @returns {Object}
 */
function resolveMarkdownOptions(argv) {
    if (argv['marked-config']) {
        return require(path.resolve(argv['marked-config']));
    } else {
        return {
            gfm: argv['marked-gfm'],
            tables: argv['marked-tables'],
            breaks: argv['marked-breaks'],
            pedantic: argv['marked-pedantic'],
            sanitize: argv['marked-sanitize'],
            smartLists: argv['marked-smartLists'],
            smartypants: argv['marked-smartypants']
        };
    }
}

var options = {
    excludeFilters: argv['exclude-filters'],
    includeFilters: argv['file-filters'],
    src: argv['input'],
    dest: argv['output'],
    verbose: argv['verbose'],
    debug: argv['debug'],
    parse: argv['parse'],
    colorize: argv['color'],
    filters: transformToObject(argv['parse-filters']),
    languages: transformToObject(argv['parse-languages']),
    parsers: transformToObject(argv['parse-parsers']),
    workers: transformToObject(argv['parse-workers']),
    silent: argv['silent'],
    simulate: argv['simulate'],
    markdown: argv['markdown'],
    marked: resolveMarkdownOptions(argv)
};

if (apidocToPostman(options) === false) {
    process.exit(1);
}
