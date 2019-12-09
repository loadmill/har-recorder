const fs = require('fs');
const CDP = require('chrome-remote-interface');

module.exports = function HarRecorder() {
    let entries = [];

    /**
     * @param {*} chromeOptions chrome-remote-interface options like port, host etc.
     * 
     * Starts recording a given chrome instance using chrome-remote-interface.
     * All requests will be stored in the HarRecorder instance until endRecording is called.
     * 
     * For avilable chrome options see -
     * https://github.com/cyrus-and/chrome-remote-interface#cdpoptions-callback
     */
    const startRecording = async (chromeOptions) => {
        const { Fetch } = await CDP(chromeOptions);

        // start listening to Fetch events at the 'Response' stage
        await Fetch.enable({ patterns: [{ requestStage: 'Response' }] });

        Fetch.requestPaused(async (event) => {

            // create HAR entry from paused request
            const entry = {
                startedDateTime: new Date().toISOString(),
                request: {
                    method: event.request.method,
                    url: event.request.url,
                    headers: convertHeaders(event.request.headers)
                },
                response: {
                    status: event.responseStatusCode,
                    headers: event.responseHeaders,
                }
            };

            // get request body if present
            if (event.request.postData) {
                entry.request.postData = {
                    text: event.request.postData,
                    size: event.request.postData.length,
                    mimeType: event.request.headers["Content-Type"] || event.request.headers["content-type"]
                }
            }

            // get response body
            const responseBody = await Fetch.getResponseBody({ requestId: event.requestId })
            const bodyString = responseBody.base64Encoded ?
                Buffer.from(responseBody.body, 'base64').toString() :
                responseBody.body;

            entry.response.content = {
                text: bodyString,
                size: bodyString.length,
                mimeType: event.responseHeaders.find(header => header.name === 'content-type' || header.name === 'Content-Type').value,
            }

            entries.push(entry);
            Fetch.continueRequest({ requestId: event.requestId });
        });

    }

    /**
     * End the recording and store it to file.
     * @param {*} path path to store the recording as HAR file.
     * This function also resets the stored entries
     */
    const endRecording = (path) => {
        const har = {
            log: {
                version: "1.2",
                creator: {
                    name: "Loadmill-Selenuim-Converter",
                    version: "0.1"
                },
                pages: [], // todo
                entries: entries
            }
        }

        fs.writeFileSync(path, JSON.stringify(har, null, 4), 'utf8', (error) => {
            if (error) console.log(error);
        });

        // reset the recording.
        entries = [];
    }

    return { startRecording, endRecording };
}

// converting headers from the CDP format {header_key: header_value, ...} 
// to the HAR format [{name:header_key, value: header_value}, ...]
const convertHeaders = (cdpHeaders) => {
    if (cdpHeaders) {
        return Object.entries(cdpHeaders).map(header => ({ name: header[0], value: header[1] }))
    } else {
        return null;
    }
}
