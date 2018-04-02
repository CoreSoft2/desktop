var path = require('path');
var execFile = require('child_process').execFile;
var packagejson = require('./package.json');
var electron = require('electron');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    //var target = grunt.option('target') || 'development';
    var target = 'production';
    var env = process.env;
    env.NODE_PATH = '..:' + env.NODE_PATH;
    env.NODE_ENV = target;

    var version = function(str) {
        var match = str.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
    };

    var clear = function(str) {
        return str.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    };

    var BASENAME = 'PivotSecurity';
    var APPNAME = BASENAME;

    var OSX_OUT = './dist';
    var OSX_OUT_X64 = OSX_OUT + '/' + APPNAME + '-darwin-x64';
    var OSX_FILENAME = OSX_OUT_X64 + '/' + APPNAME + '.app';

    var OSX_DIST_X64 = OSX_OUT + '/' + APPNAME + '-' + packagejson.version + '.pkg';

    grunt.initConfig({
        IDENTITY: 'Developer ID Application: Pivot Security',
        APPNAME: APPNAME,
        APPNAME_ESCAPED: clear(APPNAME),
        OSX_OUT: OSX_OUT,
        OSX_OUT_ESCAPED: clear(OSX_OUT),
        OSX_OUT_X64: OSX_OUT_X64,
        OSX_FILENAME: OSX_FILENAME,
        OSX_FILENAME_ESCAPED: clear(OSX_FILENAME),
        OSX_DIST_X64: OSX_DIST_X64,
        OSX_DIST_X64_ESCAPED: clear(OSX_DIST_X64),
        // electron
        electron: {
            windows: {
                options: {
                    name: BASENAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson['electron-version'],
                    platform: 'win32',
                    arch: 'ia32',
                    asar: true,
                    icon: 'util/pivot.ico'
                }
            },
            osx: {
                options: {
                    name: APPNAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson['electron-version'],
                    platform: 'darwin',
                    arch: 'x64',
                    asar: true,
                    'app-bundle-id': 'com.pivot.security.desktop',
                    'app-version': packagejson.version
                }
            }
        },

        prompt: {
            'create-windows-installer': {
                options: {
                    questions: [{
                        config: 'certificatePassword',
                        type: 'password',
                        message: 'Certificate Password: '
                    }]
                }
            }
        },

        rcedit: {
            exes: {
                files: [{
                    expand: true,
                    cwd: 'dist/' + BASENAME + '-win32-ia32',
                    src: [BASENAME + '.exe']
                }],
                options: {
                    icon: 'util/pivot.ico',
                    'file-version': packagejson.version,
                    'product-version': packagejson.version,
                    'version-string': {
                        'CompanyName': 'Pivot Security Limited',
                        'ProductVersion': packagejson.version,
                        'ProductName': APPNAME,
                        'FileDescription': APPNAME,
                        'InternalName': BASENAME + '.exe',
                        'OriginalFilename': BASENAME + '.exe',
                        'LegalCopyright': 'Copyright 2015 Pivot Security Limited. All rights reserved.'
                    }
                }
            }
        },

        'create-windows-installer': {
            config: {
                appDirectory: path.join(__dirname, 'dist/' + BASENAME + '-win32-ia32'),
                outputDirectory: path.join(__dirname, 'dist'),
                authors: 'Pivot Security Limited',
                loadingGif: 'util/loading.gif',
                setupIcon: 'util/setup.ico',
                iconUrl: 'https://www.pivotsecurity.com/pivot.ico',
                description: APPNAME,
                title: APPNAME,
                exe: BASENAME + '.exe',
                version: packagejson.version
            }
        },

        // images
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['package.json', 'settings.json', 'index.html'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'images/',
                    src: ['**/*'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'fonts/',
                    src: ['**/*'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'translations/',
                    src: ['**/*'],
                    dest: 'build/translations'
                }, {
                    cwd: 'node_modules/',
                    src: Object.keys(packagejson.dependencies).map(function (dep) { return dep + '/**/*';}),
                    dest: 'build/node_modules/',
                    expand: true
                }]
            },
            release: {
                files: [{
                    cwd: 'node_modules/',
                    src: [
                        '**/*',
                        '!*grunt*',
                        '!*babel*',
                        '!*gulp*'
                    ],
                    dest: 'build/node_modules/',
                    expand: true
                }]
            },
            windows: {
                files: [{
                    expand: true,
                    cwd: 'resources/bin/win32',
                    src: ['**/*'],
                    dest: 'dist/' + BASENAME + '-win32-ia32/resources/bin'
                }, {
                    expand: true,
                    cwd: 'resources/config',
                    src: ['**/*', '!**/*.ovpn'],
                    dest: 'dist/' + BASENAME + '-win32-ia32/resources/config'
                }, {
                    expand: true,
                    cwd: 'resources/log',
                    src: ['**/*'],
                    dest: 'dist/' + BASENAME + '-win32-ia32/resources/log'
                }],
                options: {
                    mode: true
                }
            },
            osx: {
                files: [{
                    expand: true,
                    cwd: 'resources/bin/darwin',
                    src: ['**/*'],
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/bin/'
                }, {
                    expand: true,
                    cwd: 'resources/config',
                    src: ['**/*', '!**/*.ovpn'],
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/config/'
                }, {
                    expand: true,
                    cwd: 'resources/log',
                    src: ['**/*'],
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/log/'
                }, {
                    src: 'util/pivot.icns',
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/pivot.icns'
                }],
                options: {
                    mode: true
                }
            }
        },

        // styles
        less: {
            options: {
                sourceMapFileInline: true
            },
            dist: {
                files: {
                    'build/main.css': 'styles/main.less'
                }
            }
        },

        // javascript
        babel: {
            options: {
                sourceMap: 'inline',
                presets: ['es2015', 'react']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js'],
                    dest: 'build/',
                }]
            }
        },

        shell: {
            electron: {
                command: electron + ' ' + 'build',
                options: {
                    async: true,
                    execOptions: {
                        env: env
                    }
                }
            },
            sign: {
                options: {
                    failOnError: false,
                },
                command: [
                    'codesign --deep -v -f -s "<%= IDENTITY %>" <%= OSX_FILENAME_ESCAPED %>/Contents/Frameworks/*',
                    'codesign -v -f -s "<%= IDENTITY %>" <%= OSX_FILENAME_ESCAPED %>',
                    'codesign -vvv --display <%= OSX_FILENAME_ESCAPED %>',
                    'codesign -v --verify <%= OSX_FILENAME_ESCAPED %>'
                ].join(' && '),
            },
            macdist: {
                options: {
                    failOnError: false,
                },
                command: [
                    'util/mac/mac-dist',
                    'codesign -v -f -s "<%= IDENTITY %>" <%= OSX_DIST_X64 %>',
                    'codesign -vvv --display <%= OSX_DIST_X64 %>',
                    'codesign -v --verify <%= OSX_DIST_X64 %>'
                ].join(' && '),
            },
            macdistci: {
                options: {
                    failOnError: false,
                },
                command: [
                    'util/mac/linux-dist'
                ].join(' && '),
            },
            zip: {
                command: 'ditto -c -k --sequesterRsrc --keepParent <%= OSX_FILENAME_ESCAPED %> dist/' + BASENAME + '-' + packagejson.version + '-Mac.zip',
            },
            makensis: {
                command: 'makensis util/windows/installer.nsi',
            }
        },

        clean: {
            release: ['build/', 'dist/'],
        },

        compress: {
            windows: {
                options: {
                    archive: './dist/' + BASENAME + '-' + packagejson.version + '-Windows.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/PivotSecurity-win32-ia32',
                    src: '**/*'
                }]
            },
        },

        // livereload
        watchChokidar: {
            options: {
                spawn: true
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['build/**/*']
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['newer:babel']
            },
            less: {
                files: ['styles/**/*.less'],
                tasks: ['less']
            },
            copy: {
                files: ['images/*', 'index.html', 'fonts/*'],
                tasks: ['newer:copy:dev']
            }
        }
    });

    grunt.registerTask('default', ['newer:babel', 'less', 'newer:copy:dev', 'shell:electron', 'watchChokidar']);

    if (process.platform === 'win32') {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:dev', 'copy:release', 'electron:windows', 'copy:windows', 'rcedit:exes', 'compress']);
    } else {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:dev', 'copy:release', 'electron:osx', 'copy:osx', 'shell:sign', 'shell:zip', 'shell:macdist']);
    }

    grunt.registerTask('ci', ['clean:release', 'babel', 'less', 'copy:dev', 'copy:release', 'electron:osx', 'electron:windows', 'copy:osx', 'copy:windows', 'rcedit:exes', 'shell:sign', 'shell:macdistci', 'shell:makensis']);

    process.on('SIGINT', function() {
        grunt.task.run(['shell:electron:kill']);
        process.exit(1);
    });
};