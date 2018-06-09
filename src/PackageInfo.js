import _ from 'lodash';
import fs from 'fs';
import path from 'path';

class PackageInfo {
    constructor(app) {
        this.app = app;
    }

    get() {
        var app = this.app;
        var result = {};

        // Read package.json
        var packageJson = this._readPackageData('package.json');

        if (packageJson.apidoc)
            result = packageJson.apidoc;

        result = _.defaults({}, result, {
            name       : packageJson.name        || '',
            version    : packageJson.version     || '0.0.0',
            description: packageJson.description || '',
        });

        // read apidoc.json (and overwrite package.json information)
        var apidocJson = this._readPackageData('apidoc.json');

        // apidoc.json has higher priority
        _.extend(result, apidocJson);

        // options.packageInfo overwrites packageInfo
        _.extend(result, app.options.packageInfo);

        // replace header footer with file contents
        _.extend(result, this._getHeaderFooter(result));

        if (Object.keys(apidocJson).length === 0)
            app.log.warn('Please create an apidoc.json.');

        return result;
    }

    _readPackageData(filename) {
        var app = this.app;
        var result = {};
        var jsonFilename = path.join(app.options.src, filename);

        // read from source dir
        if ( ! fs.existsSync(jsonFilename)) {
            // read vom current dir
            jsonFilename = './' + filename;
        }
        if ( ! fs.existsSync(jsonFilename)) {
            app.log.debug(filename + ' not found!');
        } else {
            try {
                result = JSON.parse( fs.readFileSync(jsonFilename, 'utf8') );
                app.log.debug('read: ' + jsonFilename);
            } catch (e) {
                throw new Error('Can not read: ' + filename + ', please check the format (e.g. missing comma).');
            }
        }
        return result;
    }

    _getHeaderFooter(json) {
        var app = this.app;
        var result = {};

        ['header', 'footer'].forEach(function(key) {
            if (json[key] && json[key].filename) {
                var filename = path.join(app.options.src, json[key].filename);
                if ( ! fs.existsSync(filename))
                    filename = path.join('./', json[key].filename);

                try {
                    app.log.debug('read header file: ' + filename);
                    var content = fs.readFileSync(filename, 'utf8');
                    result[key] = {
                        title  : json[key].title,
                        content: app.markdown ? app.markdown(content) : content
                    };
                } catch (e) {
                    throw new Error('Can not read: ' + filename + '.');
                }
            }
        });

        return result;
    }
}

export default PackageInfo;