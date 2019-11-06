'use strict'

const news = require('./news');

(async () => { 
    let articles = await news.getNews('./files/news/top-headlines.json');
    let contents = await news.getContent(articles);

    if (contents) {
        await news.generateAudio('./files/data.json');
    }
})();