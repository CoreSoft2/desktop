import _ from 'lodash';
import request from 'request';
import metrics from './MetricsUtil';
import {t} from './localizationUtil';
import log from '../stores/LogStore';
import ServerActions from '../actions/ServerActions';

let MYIP_ENDPOINT = process.env.MYIP_ENDPOINT || 'https://www.pivotsecurity.com/servers';

var MyipUtil = {
    init: function() {},

    fetch: function() {
        return MyipUtil._getRemoteServers()
            .then(function(servers) {
                log.info('MyipUtil.fetch - ' + servers.length + ' servers')
                ServerActions.receiveAll(servers);
            });
    },

    status: function(callback) {
        request.get(`${MYIP_ENDPOINT}/status`, (error, response, body) => {
            callback(error, response, body);
        });
    },

    _servers: function(callback) {
        return new Promise((resolve, reject) => {
            //request.get(`${MYIP_ENDPOINT}/admin-ajax.php?type=servers`, (error, response, body) => {
            request.get(`https://pivotcloudsolutions.com/servers.json`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response.body);
                }
            });
        });
    },

    _getRemoteServers: function() {

        var options = [{
            value: 'www.pivotsecurity.com',
            label: t('Nearest Server (Based on Location)'),
            country: 'blank'
        }];
        var serverName;
        return new Promise((resolve) => {
            MyipUtil._servers()
                .then(function(response) {
                    var servers = JSON.parse(response);

                    _.each(servers, function(server, country) {

                        serverName = server.countryName + ' - ' + server.host.toUpperCase().replace(/^\D+/g, '') + ' (' + Math.round(server.distance) + ' KM)';

                        if (server.regionName) {
                            serverName = server.regionName + ", " + serverName;
                        }

                        if (server.city) {
                            serverName = server.city + ", " + serverName;
                        }

                        options.push({
                            value: server.ip,
                            label: serverName,
                            distance: Math.round(server.distance),
                            country: server.country
                        });
                    });

                    resolve(options);
                })
                .catch(function(err) {
                    console.log(err);
                });
        });

    }

};

module.exports = MyipUtil;