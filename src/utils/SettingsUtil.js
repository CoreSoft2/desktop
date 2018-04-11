import log from '../stores/LogStore';

var defaultSettings = {
    launchStartup: true,
    launchStartupHidden: true,
    connectLaunch: true,
    saveCredentials: true,
    disableSmartdns: false,
    autoPath: false,
    minToTaskbar: true
};

module.exports = {
    get: function(item) {
        var haveDefault = null,
            value = localStorage.getItem('settings.' + item);

        // hack to parse the local storage type and fully
        // backward compatible
        try {
            value = JSON.parse(value);
        } catch (e) {
            if (value === 'true' || 'false') {
                value = (value === 'true') ? true : false;
            }
        }

        if (defaultSettings[item] && value === null) {
            value = defaultSettings[item];
        }

        return value;
    },

    save: function(key, value, displayValue) {
        log.info('Preferences | ' + key + ' = ' + (displayValue || value));
        localStorage.setItem('settings.' + key, JSON.stringify(value));
    }
}