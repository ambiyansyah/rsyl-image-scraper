"use strict";

const Scraper = require('./lib/google-images-scraper');
const argv = require('yargs').argv;
const UserAgent = require('user-agents');
const download = require('image-downloader');
const fs = require('fs');

let userAgent = new UserAgent();
let keyword = argv.keyword.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').toLowerCase();
let google = new Scraper.Google({
    keyword: keyword,
    userAgent: userAgent.toString(),
    limit: argv.limit,
    puppeteer: {
        headless: false
    },
    advanced: {
        imgType: 'photo',   // options: clipart, face, lineart, news, photo
        resolution: 'l',       // options: l(arge), m(edium), i(cons), etc.
        color: undefined  // options: color, gray, trans
    }
});

const downloadImages = async (results) => {
    const dir = `./images/${keyword.replace(/\s+/g, '-')}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let downloadedFile = [];

    for (let result of results) {

        if (result.type) {
            let imgTitle = result.title.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ');
            let imgAlt = imgTitle.replace(/\s+/g, '-').toLowerCase();
            let imgFilename = imgAlt + '.' + result.type;

            const options = {
                url: result.url,
                dest: `${dir}/${imgFilename}`,
                headers: {
                    'User-Agent': userAgent.toString()
                }
            }

            try {
                console.log(`download ${result.url}`);
                const { filename, image } = await download.image(options)
                downloadedFile.push(filename)
            } catch (error) {
                console.log(error)
            }
        }
    }

    return downloadedFile;
}

(async () => {
    console.log(`searching image links with keyword: ${keyword}`);
    const results = await google.start();      // search images link base on keyword given
    console.log(`found ${results.length} image links`);
    
    console.log(`start download images`);
    const download = await downloadImages(results);  // start to download images

    console.log('results', download.length);
})();