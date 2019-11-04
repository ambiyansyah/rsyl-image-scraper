'use strict'

const news = require('./news');

(async () => { 
    // get news list from json file
    let articles = await news.getNews('./files/news/everything.json');
    // save content from news link
    let contents = await news.getContent(articles);

    console.log(Object.keys(contents).length);

    // for (let article of articles) {
    //     await news.content(article);
    // }
})();