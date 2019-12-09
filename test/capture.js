import { Builder, By, until } from "selenium-webdriver";
const chrome = require('selenium-webdriver/chrome');

const HarRecorder = require('../');

describe('Capture har from selenium', async function () {
    let driver;
    this.timeout(10000);

    // create an HarRecorder  
    const { startRecording, endRecording } = HarRecorder();

    before(async () => {
        let chrome_options = new chrome.Options()
            .addArguments("--remote-debugging-port=9223");

        driver = await new Builder()
            .setChromeOptions(chrome_options)
            .forBrowser('chrome')
            .build();

        // start the recording
        await startRecording({ port: 9223 });

    });

    it('Load test blog', async function () {

        await driver.navigate().to('https://www.google.com');
        await driver.wait(until.elementLocated(By.name('q')));

    });

    after(async () => {
        // stop the recording and save to file 
        endRecording('create-blog-post.har');
        driver.quit();
    });
});

