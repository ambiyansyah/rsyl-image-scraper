'use strict'

const news = require('./news');

(async () => { 
    let articles = await news.get();

    for (let article of articles) { 
        let content = await news.content(article.url);

        console.log(content);
    }
})();