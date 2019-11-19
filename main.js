"use strict"

const argv = require('yargs').argv;
const fs = require('fs-extra');
const utils = require('./utils/utils');

const news = require("./api/news/news");
const image = require("./api/image/image");

(async () => { 
    if (fs.existsSync(argv.source)) { 
        let sources = await news.readSource(argv.source);
        let contents = await news.getContent(sources);

        for (let content of contents) { 
            let title = await utils.cleanWord(content.title);
            let slug = await utils.stripWord(content.title);
            let directories = await utils.prepareDirectories(content.title);
            let images = await image.searchImages(content.title);
            let downloaded = await image.downloadImages(images, directories);
            let audio = await utils.textToVoice(content.text, directories);

            console.log(images);
        }

        return
    }

    console.log("source file not found!");
})();

// TUTORIAL: Cara Menonton Video di Youtube! Eps. 1
// TUTORIAL: Cara Menonton Video di Youtube! Ending

// Tutorial subscribe channel MLI

// Tutorial cara block channel atta halilintar

// Berapa penghasilan youtuber dengan subscriber terbanyak di INDONESIA?