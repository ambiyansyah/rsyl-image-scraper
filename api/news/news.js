'use strict'

const fs = require('fs');
const readArt = require('read-art');
const htmlToText = require('html-to-text');

module.exports = {
    async get() {
        let rawdata = fs.readFileSync('./files/news/top-headlines.json');
        let articles = JSON.parse(rawdata);

        return articles.articles;
    },
    async content(url) {
        let response

        try {
            readArt(url, function (err, art, options, resp) {
                if (err) {
                    console.log(err)
                    return
                }

                console.log('[STATUS CODE]', resp && resp.statusCode)

                let title = art.title
                let content = art.content
                let html = art.html

                const text = htmlToText.fromString(content, {
                    wordwrap: false,
                    hideLinkHrefIfSameAsText: true,
                    ignoreHref: true,
                    ignoreImage: true,
                    singleNewLineParagraphs: true

                });
                console.log('====================================================');
                console.log(title)
                console.log(text)
                console.log('====================================================');

            });
        } catch (error) {
            console.log(error)
        }
    }
}