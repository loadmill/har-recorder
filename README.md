# har-recorder

Use this package to capture HAR recordings from Chrome sessions or Selenium tests.

## Selenium usage example

```javascript
const { startRecording, endRecording } = HarRecorder();

// enable chrome remote debugging on port 9223
let chrome_options = new chrome.Options()
    .addArguments("--remote-debugging-port=9223");

driver = await new Builder()
    .setChromeOptions(chrome_options)
    .forBrowser('chrome')
    .build();

// start the recording on port 9223
await startRecording({ port: 9223 });

// do Selenium stuff 
await driver.navigate().to('http://www.google.com');
await driver.wait(until.elementLocated(By.name('identification')));

// save recording to file
endRecording('create-blog-post.har');
driver.quit();    
```

## Installation

    npm install har-recorder

## Setup

An instance of either Chrome itself or another implementation needs to be
running on a known port in order to use this module (defaults to
`localhost:9222`).

## API

The API consists of three parts:

- The constractor function which creates a new HarRecorder.

- `startRecording([options])` which starts recording a given Chrome instance. The recording defaults to
`localhost:9222`. Overide this by passing a [CDP options object](https://github.com/cyrus-and/chrome-remote-interface/blob/master/README.md#cdpoptions-callback).

- `endRecording(filePath)` which saves the recording to file resets the stored requests.  
