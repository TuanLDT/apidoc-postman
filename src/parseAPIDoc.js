import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import upperCase from 'upper-case';
import tableify from 'html-tableify';

let apiDoc = {};
class ParseAPIDoc {
    constructor() {
        this._formatAPI = this._formatAPI.bind(this);
    }

    toPostman(apidocJson, projectJson) {
        apiDoc.info = this.addInfo(projectJson);
        apiDoc.item = this.addItem(apidocJson);
        return apiDoc;
    }

    addInfo(projectJson) {
        let info = {};
        info['name'] = projectJson.title || projectJson.name;
        info['schema'] = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
        return info;
    }

    addItem(apidocJson) {
        let items = this._groupItemByGroup(apidocJson);
        return items;
    }

    _groupItemByGroup(apidocJson) {
        let self = this;
        let groups = _.groupBy(apidocJson, 'group');
        return _.map(groups, function(apisInGroup, key) {
            let item = _.map(apisInGroup, self._formatAPI);
            return {
                name: key,
                description: '',
                item: item
            };
        }) ;
    }

    _formatAPI(api) {
        let url = api.url;
        var pattern = pathToRegexp(url, null);
        var matches = pattern.exec(url);

        // Surrounds URL parameters with curly brackets -> :email with {email}
        var pathKeys = [];
        for (var j = 1; j < matches.length; j++) {
            var key = matches[j].substr(1);
            url = url.replace(matches[j], '{'+ key +'}');
            pathKeys.push(key);
        }

        api.url = url;
        api.type = upperCase(api.type);
        return {
            name: api.title,
            request: {
                method: api.type,
                header: [
                    {
                        key: 'Content-Type',
                        value: 'application/json'
                    },
                    {
                        key: 'Accept',
                        value: 'application/json'
                    }
                ],
                url: {
                    raw: `http://{{host}}${url}`,
                    protocol: 'http',
                    host: [
                        '{{host}}'
                    ],
                    path: url.split('/')
                },
                description: this._formatAPIDescription(api)
            }
        };
    }

    _formatMethodColor(method) {
        let color;
        switch(method) {
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
        return `<span style="color:${color}">${method}</span>`;
    }

    _formatParams(api) {
        if (!api.parameter) {
            return '';
        }

        let params = api.parameter.fields.Parameter;
        params = _.map(params, (param) => {
            return _.omit(param, ['group']);
        });
        return '<br/>**Params:**\n'
            + `${tableify(params)}\n\n`;
    }

    _formatResponse(api) {
        if (!api.success) {
            return '';
        }

        let {examples, fields} = api.success;
        

        let data = '';

        if (fields || (examples && examples.length)) {
            data += '<br/>**Response:**\n';
        }

        if (fields) {
            let responses =[];
            _.mapKeys(fields, function(params, key) {
                params = _.map(params, (param) => {
                    return _.omit(param, ['group']);
                });
                responses.push(` ***${key}***\n\n`
                + `${tableify(params)}\n\n`);
            });
            data += `${responses.join('\n\n')}\n\n`;
        }

        if (examples && examples.length) {
            data = data + '<br/>**Success response example:**\n\n'
            + '```json\n'
            + examples[0].content
            + '\n```';
        }

        return data;  
    }

    _formatAPIDescription(api) {
        return `# ${api.description}\n\n\n\n`
        + `**URL**: \`${api.url}\`\n\n`
        + `**Method**: \`${api.type}\`\n\n`
        + `${this._formatParams(api)}`
        + `${this._formatResponse(api)}`;
    }
}

export default new ParseAPIDoc;