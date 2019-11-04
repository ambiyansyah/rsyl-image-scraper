'use strict'

const imageHandler = require('./image');
const newsHandler = require('../news/news');
const utl = require('./../../utl/clean');

(async () => {
    let newsList = await newsHandler.get();
    
    for (let news of newsList) { 
        let keyword = utl.cleanWord(news.title);

        let imageLinks = await imageHandler.search({
            keyword: keyword,
            limit: 500,
            puppeteerOptions: {
                headless: true
            },
            advanced: {
                // options: clipart, face, lineart, news, photo
                imgType: 'photo',
                // options: l(arge), m(edium), i(cons), etc.
                // resolution: 'l',
                // options: color, gray, trans
                color: undefined
            }
        })

        let imageFiles = await imageHandler.download({
            keyword: keyword,
            results: imageLinks
        });

        console.log(imageFiles);
    }
})();