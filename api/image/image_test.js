'use strict'

const imageHandler = require('./image');

(async () => {
    let keyword = 'gempa jawa barat';

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
            resolution: 'l',
            // options: color, gray, trans
            color: undefined
        }
    })

    console.log(imageLinks.length);

    let imageFiles = await imageHandler.download({
        keyword: keyword,
        results: imageLinks
    });

    console.log(imageFiles);
})();