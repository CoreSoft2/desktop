import alt from '../alt';
import ServerActions from '../actions/ServerActions';

class ServerStore {
    constructor() {

        this.bindActions(ServerActions);
        this.servers = [{
            value: 'www.pivotsecurity.com',
            label: 'Nearest Server (Based on Location)',
            country: 'blank'
        }];
    }

    onReceiveAll(servers) {
        this.setState({
            servers
        });
    }

}

export default alt.createStore(ServerStore);