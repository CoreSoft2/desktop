import { remote } from 'electron';
import fs from 'fs';
import promisify from 'es6-promisify';
import React from 'react';
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import LogStore from '../stores/LogStore';
import LogActions from '../actions/LogActions';

const writeFile = promisify( fs.writeFile );

const saveLogsToClipboard = (messages) => {
    remote.clipboard.writeText( messages.join( '\n' ) );
    remote.dialog.showMessageBox({
        type: 'info',
        title: T.translate( 'Log Copied' ),
        buttons: [ T.translate( 'OK' ) ],
        message: T.translate( 'Your log file has been copied successfully' )
    });
}

const saveLogsToFile = async (messages) => {
    const path = remote.dialog.showSaveDialog({
        title: T.translate( 'Select path for log file' ),
        filters: [{
            name: T.translate( 'Log files' ),
            extensions: [ 'log' ]
        }]
    });

    try {
        await writeFile( path, messages.join( '\n' ) );

        remote.dialog.showMessageBox({
            type: 'info',
            title: T.translate( 'Log saved!' ),
            buttons: [ T.translate( 'OK' ) ],
            message: T.translate( 'Your log file has been saved successfully.' )
        });
    }
    catch( e ) {
        console.log( e );

        remote.dialog.showErrorBox(
            T.translate( 'Unable to save log path' ),
            T.translate( 'Looks like we can\'t save the log file.\nTry again with another path' )
        );
    }
}

class LogViewer extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            messages: []
        };

        LogStore.listen( ({messages}) => {
            this.setState({ messages });
        });
    }

    render() {
        const { messages } = this.state;

        return (
            <section>
                <h1 className="title">{T.translate('Connection report')}</h1>

                <textarea ref="logsTextarea" className="logs" name="description" value={messages.join( '\n' )} readOnly />

                <button className="left" type="submit" onClick={async () => await saveLogsToFile( messages )}>
                    <p>{T.translate('Export')}</p>
                </button>

                <button className="left" type="submit" onClick={() => saveLogsToClipboard( messages )}>
                    <p>{T.translate('Copy to clipboard')}</p>
                </button>
            </section>
        );
    }
}

export default LogViewer;