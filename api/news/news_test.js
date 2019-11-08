'use strict'

const news = require('./news');

(async () => { 
    let sources = await news.readSource('./files/news/top-headlines.json');
    let contents = await news.getContent(sources);

    console.log(contents.length);
})();