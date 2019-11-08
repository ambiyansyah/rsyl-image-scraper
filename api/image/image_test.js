'use strict'

const image = require('./image');
const news = require('../news/news');
const video = require('../video/video');
const clean = require('./../../utl/clean');
const utils = require('./../../utils/utils');
const fs = require('fs-extra');
const Jimp = require('jimp');

(async () => {
    const data = './files/data.json';
    const rawData = await fs.readFile(data);
    const contents = JSON.parse(rawData);
    
    let count = 0;
    for (let content of contents) {
        if (count == 0) { 
            content = JSON.parse(content);

            // prepare directories to save the data
            let directories = await utils.prepareDirectories(content.title);
            // search image links from google image search
            let images = await image.searchImages(content.title);
            // download iamges from search result
            let downloads = await image.downloadImages(images, directories);
            // resize image 
            let resize = await image.resize(downloads, 800, 600, 90);
            // create audio from content text
            let audio = await utils.textToVoice(content.text, directories);
            // create video from image files
            let createvideo = await video.create(content, downloads, directories);
        }

        count++;
    }
})();