'use strict'

const fs = require('fs');
const readArt = require('read-art');
const htmlToText = require('html-to-text');
const read = require('node-readability');
const utl = require('./../../utl/clean');
const sanitizeHtml = require('sanitize-html');
const textCleaner = require('text-cleaner');
const say = require('say');
const fsExtra = require('fs-extra');

module.exports = {
    async get() {
        let rawdata = fs.readFileSync('./files/news/top-headlines.json');
        let articles = JSON.parse(rawdata);

        return articles.articles;
    },
    async content(url) {
        let data = {};

        try {
            read(url, function (err, article, meta) {
                if (err) {
                    throw err
                }

                const html = sanitizeHtml(article.content);

                readArt(html, function (err, art, options, resp) {
                    if (err) {
                        console.log(err);
                        return data;
                    }

                    console.log('[STATUS CODE]', resp && resp.statusCode);

                    data.title = article.title
                    data.content = htmlToText.fromString(art.content, {
                        wordwrap: false,
                        hideLinkHrefIfSameAsText: true,
                        ignoreHref: true,
                        ignoreImage: true,
                        singleNewLineParagraphs: true
                    });

                    data.content = textCleaner(data.content).condense().toLowerCase().stripEmails().valueOf();

                    console.log('=========================');
                    console.log(data.title);
                    console.log(data.content);
                    console.log('=========================');

                    if (data.content) { 
                        const filename = await utl.stripWord(data.title);
                        const dir = `./files/news/${filename}`;
                        
                        fsExtra.ensureDirSync(filename);

                        say.export(data.content, 'Microsoft Zira Desktop', 1, `${dir}/${filename}.wav`, (err) => {
                            if (err) {
                                return console.error(err)
                            }

                            console.log(`Text has been saved to ${filename}.wav.`)
                        });
                    }
                    
                });
            });
        } catch (error) {
            throw error
        }
    }
}