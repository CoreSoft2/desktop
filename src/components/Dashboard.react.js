import React from 'react';
import metrics from '../utils/MetricsUtil';
import Router from 'react-router';

import Connect from './DashboardConnect.react';
import ConnectionDetails from './DashboardConnectionDetails.react';

import accountStore from '../stores/AccountStore';

var Preferences = React.createClass({
    mixins: [Router.Navigation],
    getInitialState: function() {
        return {
            connected: accountStore.getState().connected,
            mounted:false
        };
    },

    componentDidMount: function() {
        this.setState({
            mounted: true
        });
        accountStore.listen(this.update);
    },

    componentWillUnmount: function() {
        this.setState({
            mounted: false
        });
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

        var toMount = < Connect / > ;
        if (this.state.connected) {
            toMount = < ConnectionDetails / > ;
        }

        return ( < div className = "content-scroller"
            id = "content" > {toMount} < /div>
        );

    }

});


module.exports = Preferences;