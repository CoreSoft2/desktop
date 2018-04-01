import React from 'react';
import metrics from '../utils/MetricsUtil';
import Router from 'react-router';
import Select from 'react-select';
import VPN from '../utils/VPNUtil';
import Settings from '../utils/SettingsUtil';
import {
    t
}
from '../utils/localizationUtil';

var Preferences = React.createClass({
    mixins: [Router.Navigation],
    getInitialState: function() {
        return {
            metricsEnabled: metrics.enabled(),
            launchStartup: Settings.get('launchStartup'),
            launchStartupHidden: Settings.get('launchStartupHidden'),
            connectLaunch: Settings.get('connectLaunch'),
            saveCredentials: Settings.get('saveCredentials'),
            autoPath: Settings.get('autoPath'),
            disableSmartdns: Settings.get('disableSmartdns'),
            customPort: Settings.get('customPort') || 'default',
            minToTaskbar: Settings.get('minToTaskbar')
        };
    },

    handleChangeMetricsEnabled: function(e) {
        var checked = e.target.checked;
        this.setState({
            metricsEnabled: checked
        });
        metrics.setEnabled(checked);
        metrics.track('Toggled util/MetricsUtil', {
            enabled: checked
        });
    },

    handleChangeLaunchStartup: function(e) {

        var checked = e.target.checked;
        this.setState({
            launchStartup: checked
        });

        if (checked) {
            VPN.enableStartOnBoot(this.state.launchStartupHidden);
        } else {
            VPN.disableStartOnBoot();
        }

        // save for future use
        Settings.save('launchStartup', checked);

    },


    handleChangeLaunchStartupHidden: function(e) {

        var checked = e.target.checked;
        this.setState({
            launchStartupHidden: checked
        });

        if (checked) {
            VPN.enableStartOnBoot(true);
        } else {
            VPN.disableStartOnBoot();
        }

        // save for future use
        Settings.save('launchStartupHidden', checked);

    },

    handleChangeDisableSmartdns: function(e) {

        var checked = e.target.checked;
        this.setState({
            disableSmartdns: checked
        });

        // save for future use
        Settings.save('disableSmartdns', checked);

    },

    handleChangeMinToTaskbar: function(e) {

        var checked = e.target.checked;
        this.setState({
            minToTaskbar: checked
        });

        // save for future use
        Settings.save('minToTaskbar', checked);

    },


    handleChangeConnectLaunch: function(e) {

        var checked = e.target.checked;
        this.setState({
            connectLaunch: checked
        });

        // save for future use
        Settings.save('connectLaunch', checked);

    },

    handleChangeAutoPath: function(e) {

        var checked = e.target.checked;
        this.setState({
            autoPath: checked
        });

        // save for future use
        Settings.save('autoPath', checked);

    },

    handlePortChange: function(customPort) {

        this.setState({
            customPort: customPort.value
        });
        Settings.save('customPort', customPort.value);
    },

    render: function() {

        var ports;
        var customPort = "";
        if (!this.state.autoPath) {
            customPort = (
                <section className="preferences">
                    <h1 className="title">{t('Custom Port')}</h1>
                    <div className="selectbox">
                        <Select
                            name="customPort"
                            value={this.state.customPort}
                            options={ports}
                            onChange={this.handlePortChange}
                            searchable={false}
                            clearable={false}
                        />
                    </div>
                </section>
            );
        }

        return (
            <div className="content-scroller" id="content">
                <section>
                        <h1 className="title">{t('General')}</h1>
                        <div className="checkbox">
                            <input id="reportAnon" type="checkbox" checked={this.state.metricsEnabled} onChange={this.handleChangeMetricsEnabled}/>
                            <label htmlFor="reportAnon">
                                <p>{t('Report anonymous usage analytics')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="saveCredentials" disabled={!this.state.saveCredentials}  type="checkbox" checked={this.state.connectLaunch && this.state.saveCredentials} onChange={this.handleChangeConnectLaunch}/>
                            <label htmlFor="saveCredentials">
                                <p>{t('Auto-connect after launch (requires a saved user/pass)')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="launchStartup" type="checkbox" checked={this.state.launchStartup} onChange={this.handleChangeLaunchStartup}/>
                            <label htmlFor="launchStartup">
                                <p>{t('Launch on operating system startup')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="launchStartupHidden" type="checkbox" checked={this.state.launchStartupHidden} onChange={this.handleChangeLaunchStartupHidden}/>
                            <label htmlFor="launchStartupHidden">
                                <p>{t('Launch on operating system startup hidden')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="disableSmartdns" type="checkbox" checked={this.state.disableSmartdns} onChange={this.handleChangeDisableSmartdns}/>
                            <label htmlFor="disableSmartdns">
                                <p>{t('Disable SmartDNS')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="minToTaskbar" type="checkbox" checked={this.state.minToTaskbar} onChange={this.handleChangeMinToTaskbar}/>
                            <label htmlFor="minToTaskbar">
                                <p>{t('Minimize to taskbar')}</p>
                            </label>
                        </div>
                </section>
                {customPort}
                <section className="preferences">
                    <h1 className="title">{t('Auto Path')}</h1>
                    <div className="checkbox">
                        <input type="checkbox" id="autopath" checked={this.state.autoPath} onChange={this.handleChangeAutoPath} />
                        <label htmlFor="autopath">
                            <p>{this.state.autoPath ? t('Enabled') : t('Disabled')}</p>
                        </label>
                        <p className="info">{t('Feature that tries alternate ports in order to resolve certain types of connections issues.')}</p>
                    </div>
                </section>
            </div>

        );
    }
});

module.exports = Preferences;