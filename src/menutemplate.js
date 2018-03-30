import {remote, shell} from 'electron';
import router from './router';
import metrics from './utils/MetricsUtil';
import util from './utils/Util';
import {t} from './utils/localizationUtil';

var dialog = remote.dialog;
var app = remote.app;

// main.js
var MenuTemplate = function() {
    return [{
        label: 'PivotSecurity',
        submenu: [{
            label: t('Manage Account'),
            click: function() {
                metrics.track('Opened Billing on PivotSecurity', {
                    from: 'menu'
                });
                shell.openExternal('https://www.pivotsecurity.com/profile');
            }
        }, {
            type: 'separator'
        }, {
            label: t('Quit'),
            accelerator: util.CommandOrCtrl() + '+Q',
            click: function() {
                app.quit();
            }
        }]
    }, {
        label: t('View'),
        submenu: [{
            label: t('Hide') + ' PivotSecurity',
            accelerator: util.CommandOrCtrl() + '+H',
            selector: 'hide:'
        }, {
            label: t('Hide Others'),
            accelerator: util.CommandOrCtrl() + '+Shift+H',
            selector: 'hideOtherApplications:'
        }, {
            label: t('Show All'),
            selector: 'unhideAllApplications:'
        }, {
            type: 'separator'
        }, {
            label: t('Toggle DevTools'),
            accelerator: 'Alt+' + util.CommandOrCtrl() + '+I',
            click: function() {
                remote.getCurrentWindow().toggleDevTools();
            }
        }]
    }, {
        label: t('Window'),
        submenu: [{
            label: t('Minimize'),
            accelerator: util.CommandOrCtrl() + '+M',
            selector: 'performMiniaturize:'
        }, {
            label: t('Close'),
            accelerator: util.CommandOrCtrl() + '+W',
            click: function() {
                remote.getCurrentWindow().hide();
                event.preventDefault();
            }
        }, {
            type: 'separator'
        }, {
            label: t('Bring All to Front'),
            selector: 'arrangeInFront:'
        }]
    }, {
        label: t('Help'),
        submenu: [{
            label: t('Support'),
            click: function() {
                metrics.track('Opened Support on PivotSecurity', {
                    from: 'menu'
                });
                shell.openExternal('https://www.pivotsecurity.com/contact');
            }
        }, {
            label: t('Report Issue or Suggest Feedback'),
            click: function() {
                metrics.track('Opened Issue Reporter', {
                    from: 'menu'
                });
                shell.openExternal('https://www.pivotsecurity.com/contact');
            }
        }, {
            type: 'separator'
        }, {
            label: t('About'),
            accelerator: util.CommandOrCtrl() + '+I',
            click: function() {
                metrics.track('Opened About', {
                    from: 'menu'
                });
                router.get().transitionTo('about');
            }
        }]
    }];
};

module.exports = MenuTemplate;