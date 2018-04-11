import React from 'react';
import Router from 'react-router';
import myip from '../utils/MyipUtil';

import accountStore from '../stores/AccountStore';
import serverStore from '../stores/ServerStore';
import VPN from '../actions/VPNActions';
import Select from 'react-select';
import _ from 'lodash';
import log from '../stores/LogStore';
import ServerOption from './ServerListOption.react';
import ServerItem from './ServerListItem.react';
import Logs from './DashboardLogs.react';
import Settings from '../utils/SettingsUtil';
import Credentials from '../utils/CredentialsUtil';
import {t} from '../utils/localizationUtil';

var DashboardConnect = React.createClass({

    getInitialState: function () {
        return {
            connecting: accountStore.getState().connecting,
            appReady: accountStore.getState().appReady,
            username: Credentials.get().username,
            password: Credentials.get().password,
            saveCredentials: Settings.get('saveCredentials'),
            server: Settings.get('server') || 'www.pivotsecurity.com',
            servers: serverStore.getState().servers,
            _mounted: false
        };
    },

    componentDidMount: function () {
        accountStore.listen(this.update);
        serverStore.listen(this.updateServers);
        this.setState({
            _mounted: true
        });
    },

    componentWillUnmount: function () {
        accountStore.unlisten(this.update);
        serverStore.unlisten(this.updateServers);
        this.setState({
            _mounted: false
        });
    },

    update: function () {
        if (this.state._mounted) {
            this.setState({
                connecting: accountStore.getState().connecting,
                appReady: accountStore.getState().appReady
            });
        }
    },

    updateServers: function () {
        if (this.state._mounted) {
            this.setState({
                servers: serverStore.getState().servers
            });
        }
    },

    handleChange: function (key) {
        return function (e) {
            var state = {};
            state[key] = e.target.value;
            this.setState(state);
        }.bind(this);
    },

    handleConnect: function (e) {
        e.preventDefault();

        if (this.state.connecting) {
            VPN.disconnect();
        } else {
            if (!this.state.username) {
                    alert(t('Username should not be left blank'));
            } else if (!this.state.password) {
                    alert(t('Password should not be left blank'));
            } else if (!this.state.server) {
                    alert(t('You should select a server'));
            } else {

                // should we save credentials ?
                if (this.state.saveCredentials) {
                    Credentials.save(this.state.username, this.state.password);
                } else {
                    // make sure to flush previous save
                    Credentials.logout();
                }

                VPN.connect(this.state);
            }
        }
    },

    handleServer: function (val) {
        this.setState({
            server: val
        });

        // save for future use
        Settings.save('server', val, val.value);
    },

    handleChangeSaveCredentials: function (e) {
        var checked = e.target.checked;
        this.setState({
            saveCredentials: checked
        });

        // clear username/pw
        if (!checked) {
            Credentials.logout();
            this.setState({
                username: '',
                password: ''
            });
        }

        // save for future use
        Settings.save('saveCredentials', !!checked);
    },

    handleKeyPress: function (e) {
        if (e.key === 'Enter') {
            this.handleConnect(e);
        }
    },

    render: function () {
        var currentStatus = t('Loading... Dashboard->Render');
        if (this.state.appReady) {
            if (this.state.connecting) {
                    currentStatus = t('Connecting...');
            } else {
                    currentStatus = t('Disconnected');
            }
        }

    return (
            <div>

                <section>
                    <h1 className="title">{t('VPN Connection status')}</h1>
                    <div className="connectionstatus">
                        <i className={this.state.connecting ? 'ion-ios-loop spin' : 'ion-ios-close-empty disconnected'}></i>
                        <p>{currentStatus}</p>
                    </div>
                    <button disabled={!this.state.appReady} className="right" onClick={this.handleConnect}>
                        <p>{this.state.connecting ? t('cancel') : t('connect to Pivot Security')}</p>
                    </button>
                </section>

                <section>
                    <h1 className="title">{t('Login')}</h1>
                    <input name="username" disabled={!this.state.appReady} value={this.state.username || ''} onChange={this.handleChange('username')} placeholder={t('Username')} type="text" />
                    <input name="password" disabled={!this.state.appReady} value={this.state.password || ''} onChange={this.handleChange('password')} onKeyPress={this.handleKeyPress} placeholder={t('Password')} type="password" />
                    <div className="checkbox">
                        <input type="checkbox" disabled={!this.state.appReady} checked={this.state.saveCredentials} onChange={this.handleChangeSaveCredentials} id="saveCredentials" />
                        <label htmlFor="saveCredentials">
                            <p>{t('Remember my username and password')}</p>
                        </label>
                    </div>
                </section>

                <section>
                    <h1 className="title">{t('Servers')}</h1>
                    <Select
                        disabled={!this.state.appReady}
                        name="server"
                        value={this.state.server}
                        options={this.state.servers}
                        onChange={this.handleServer}
                        placeholder={t('Select server')}
                        optionComponent={ServerOption}
                        valueComponent={ServerItem}
                        searchable={false}
                        clearable={false}
                    />
                </section>

                <Logs />
            </div>
        );
    }

});

module.exports = DashboardConnect;
