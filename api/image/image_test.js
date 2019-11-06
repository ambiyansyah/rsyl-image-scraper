'use strict'

const imageHandler = require('./image');
const newsHandler = require('../news/news');
const utl = require('./../../utl/clean');
const fsExtra = require('fs-extra');

(async () => {
    const contents = JSON.parse(fsExtra.readFileSync('./files/data.json'));
    
    for (let content of contents) {
        content = JSON.parse(content);

        const keyword = utl.cleanWord(content.title);

        // let imageLinks = await imageHandler.search({
        //     keyword: keyword,
        //     limit: 500,
        //     puppeteerOptions: {
        //         headless: false
        //     },
        //     advanced: {
        //         // options: clipart, face, lineart, news, photo
        //         imgType: 'photo',
        //         // options: l(arge), m(edium), i(cons), etc.
        //         // resolution: 'l',
        //         // options: color, gray, trans
        //         color: undefined
        //     }
        // })

        let imageLinks = await imageHandler.searchImageLinks(keyword);
        let imageFiles = await imageHandler.download({
            keyword: keyword,
            results: imageLinks
        });

        console.log(imageFiles);
    }
})();