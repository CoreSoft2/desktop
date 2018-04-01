import React from 'react';
import RetinaImage from 'react-retina-image';
import accountStore from '../stores/AccountStore';
import {t} from '../utils/localizationUtil';

var SubHeader = React.createClass({

    getInitialState: function() {
        return {
            connected: accountStore.getState().connected,
            mounted : false
        };
    },

    componentDidMount: function() {
        this.state.mounted=true;
        accountStore.listen(this.update);
    },

    componentWillUnmount: function() {
        this.state.mounted = false;
        accountStore.unlisten(this.update);
    },

    update: function() {
        if (this.state.mounted) {
            this.setState({
                connected: accountStore.getState().connected
            });
        }
    },

    render: function() {
        var status;
        var greenGuyClass = 'greenguy';
        if (this.state.connected) {
            status = (
                <div className="status">
                    <p className="connected">{t('connected!')}</p>
                    <span>{t('Your internet traffic is now encrypted! and your online identity has become anonymous.')}</span>
                </div>
            );
            greenGuyClass += ' connected';
        } else {
            status = (
                <div className="status">
                    <p className="disconnected">{t('not connected!')}</p>
                    <span>{t('Your internet traffic is unencrypted and your online identity is exposed.')}</span>
                </div>
            );
        }
        return (
            <header>
                <RetinaImage className="logo" src="Logo.png"/>
                <RetinaImage className={greenGuyClass} src="Figure.png"/>
                {status}
            </header>
        );
    }
});

module.exports = SubHeader;