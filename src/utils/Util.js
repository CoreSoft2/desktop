import {exec, execFile} from 'child_process';
import {remote} from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ps from 'xps';

module.exports = {
    exec: function(args, options) {
        options = options || {};

        // Add resources dir to exec path for Windows
        if (this.isWindows()) {
            options.env = options.env || {};
            if (!options.env.PATH) {
                options.env.PATH = process.env.BIN_PATH + ';' + process.env.PATH;
            }
        }

        return new Promise((resolve, reject) => {
            let cmd = Array.isArray(args) ? args.join(' ') : args;
            let cb = function(stderr, stdout, code) {
                if (code) {
                    reject(new Error(cmd + ' returned non-zero exit code. Stderr: ' + stderr));
                } else {
                    resolve(stdout);
                }
            };

            if (Array.isArray(args)) {
                let file = args.shift();
                execFile(file, args, options, cb);
            } else {
                exec(args, options, cb);
            }
        });
    },
    killTask: function(name) {
        return new Promise((resolve, reject) => {
            module.exports.checkTaskRunning(name).then(function(task) {
                var taskon = task ? true : false;
                if (taskon)
                    ps.kill(task.pid).fork(
                        function(error) {
                            reject(new Error(error));
                        },
                        function() {
                            resolve(task);
                        }
                    );
                else
                    resolve('task not running');
            });
        });
    },
    checkTaskRunning: function(name) {
        return new Promise((resolve, reject) => {
            ps.list().fork(
                function(error) {
                    reject(error)
                },
                function(processes) {
                    resolve(_.filter(processes, function(value) {
                        if (value.name === name) {
                            return value;
                        }
                    })[0]);
                }
            );
        });
    },
    isWindows: function() {
        return process.platform === 'win32';
    },
    binsPath: function() {
        return this.isWindows() ? path.join(this.home(), 'PivotSecurity-bins') : path.join('/usr/local/bin');
    },
    binsEnding: function() {
        return this.isWindows() ? '.exe' : '';
    },
    dockerBinPath: function() {
        return path.join(this.binsPath(), 'docker' + this.binsEnding());
    },
    dockerMachineBinPath: function() {
        return path.join(this.binsPath(), 'docker-machine' + this.binsEnding());
    },
    dockerComposeBinPath: function() {
        return path.join(this.binsPath(), 'docker-compose' + this.binsEnding());
    },
    escapePath: function(str) {
        return str.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    },
    home: function() {
        return remote.app.getPath('home');
    },
    documents: function() {
        // TODO: fix me for windows 7
        return 'Documents';
    },
    supportDir: function() {
        return remote.app.getPath('userData');
    },
    CommandOrCtrl: function() {
        return this.isWindows() ? 'Ctrl' : 'Command';
    },
    removeSensitiveData: function(str) {
        if (!str || str.length === 0 || typeof str !== 'string') {
            return str;
        }
        return str.replace(/-----BEGIN CERTIFICATE-----.*-----END CERTIFICATE-----/mg, '<redacted>')
            .replace(/-----BEGIN RSA PRIVATE KEY-----.*-----END RSA PRIVATE KEY-----/mg, '<redacted>')
            .replace(/\/Users\/[^\/]*\//mg, '/Users/<redacted>/')
            .replace(/\\Users\\[^\/]*\\/mg, '\\Users\\<redacted>\\');
    },
    packagejson: function() {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    },
    settingsjson: function() {
        var settingsjson = {};
        try {
            settingsjson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));
        } catch (err) {}
        return settingsjson;
    },
    isOfficialRepo: function(name) {
        if (!name || !name.length) {
            return false;
        }

        // An official repo is alphanumeric characters separated by dashes or
        // underscores.
        // Examples: myrepo, my-docker-repo, my_docker_repo
        // Non-exapmles: mynamespace/myrepo, my%!repo
        var repoRegexp = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
        return repoRegexp.test(name);
    },
    compareVersions: function(v1, v2, options) {
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) {
                v1parts.push('0');
            }
            while (v2parts.length < v1parts.length) {
                v2parts.push('0');
            }
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }
            if (v1parts[i] === v2parts[i]) {
                continue;
            } else if (v1parts[i] > v2parts[i]) {
                return 1;
            } else {
                return -1;
            }
        }

        if (v1parts.length !== v2parts.length) {
            return -1;
        }

        return 0;
    },
    randomId: function() {
        return crypto.randomBytes(32).toString('hex');
    },
    windowsToLinuxPath: function(windowsAbsPath) {
        var fullPath = windowsAbsPath.replace(':', '').split(path.sep).join('/');
        if (fullPath.charAt(0) !== '/') {
            fullPath = '/' + fullPath.charAt(0).toLowerCase() + fullPath.substring(1);
        }
        return fullPath;
    },
    linuxToWindowsPath: function(linuxAbsPath) {
        return linuxAbsPath.replace('/c', 'C:').split('/').join('\\');
    },
    bytesToSize: function(bytes) {
        var thresh = 1000;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(2) + ' ' + units[u];
    },
    toHHMMSS: function(seconds) {
        var sec_num = parseInt(seconds, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var time = hours + ':' + minutes + ':' + seconds;
        return time;
    },
    webPorts: ['80', '8000', '8080', '3000', '5000', '2368', '9200', '8983']
};