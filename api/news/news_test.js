'use strict'

const news = require('./news');

(async () => { 
    let articles = await news.get();
    // let content = await news.content(articles[5].url);

    for (let article of articles) { 
        await news.content(article.url);
    }
})();