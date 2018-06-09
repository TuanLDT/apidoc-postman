import _ from 'lodash';
import apidoc from 'apidoc-core';
import {transports, Logger}  from 'winston';
import path from 'path';
import markdown from 'marked';
import fs from 'fs-extra';
import PackageInfo from './PackageInfo';

import parseAPIDoc from './parseAPIDoc';

var defaults = {
    dest    : path.join(__dirname, '../doc/'),
    template: path.join(__dirname, '../template/'),

    debug   : false,
    silent  : false,
    verbose : false,
    simulate: false,
    parse   : false, // only parse and return the data, no file creation
    colorize: true,
    markdown: true,

    marked: {
        gfm        : true,
        tables     : true,
        breaks     : false,
        pedantic   : false,
        sanitize   : false,
        smartLists : false,
        smartypants: false
    }
};

var app = {
    log     : {},
    markdown: false,
    options : {}
};

// uncaughtException
process.on('uncaughtException', function(err) {
    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});

function apidocToPostman(options) {
    var api;
    var apidocPath = path.join(__dirname, '../');
    var packageInfo;

    options = _.defaults({}, options, defaults);

    // paths
    options.dest     = path.join(options.dest, './');

    // options
    app.options = options;

    // logger
    app.log = new Logger({
        transports: [
            new transports.Console({
                level      : app.options.debug ? 'debug' : app.options.verbose ? 'verbose' : 'info',
                silent     : app.options.silent,
                prettyPrint: true,
                colorize   : app.options.colorize,
                timestamp  : false
            })
        ],
        exitOnError: false
    });

    // markdown
    if(app.options.markdown === true) {
        app.markdown = markdown;
        app.markdown.setOptions(app.options.marked);
    }

    try {
        packageInfo = new PackageInfo(app);

        // generator information
        var json = JSON.parse( fs.readFileSync(apidocPath + 'package.json', 'utf8') );
        apidoc.setGeneratorInfos({
            name   : json.name,
            time   : new Date(),
            url    : json.homepage,
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
        if (api === false)
            return false;

        if (app.options.parse !== true){
            var apidocData = JSON.parse(api.data);
            var projectData = JSON.parse(api.project);
            api['postmanData'] = JSON.stringify(parseAPIDoc.toPostman(apidocData , projectData)); 
            createOutputFile(api);
        }

        app.log.info('Done.');
        return api;
    } catch(e) {
        app.log.error(e.message);
        if (e.stack)
            app.log.debug(e.stack);
        return false;
    }
}

function createOutputFile(api){
    if (app.options.simulate)
        app.log.warn('!!! Simulation !!! No file or dir will be copied or created.');

    app.log.verbose('create dir: ' + app.options.dest);
    if ( ! app.options.simulate)
        fs.mkdirsSync(app.options.dest);

    //Write swagger
    app.log.verbose('write postman json file: ' + app.options.dest + 'postman.json');
    if( ! app.options.simulate)
        fs.writeFileSync(app.options.dest + './postman.json', api.postmanData); 
}

export default apidocToPostman;