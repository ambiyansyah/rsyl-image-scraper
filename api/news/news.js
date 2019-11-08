'use strict'

// const fs = require('fs');
const readArt = require('read-art');
const htmlToText = require('html-to-text');
const read = require('node-readability');
const clean = require('./../../utl/clean');
const sanitizeHtml = require('sanitize-html');
const textCleaner = require('text-cleaner');
const say = require('say');
const fs = require('fs-extra');
const extractor = require('unfluff');
const request = require('async-request');
const axios = require('axios');
const randomUserAgent = require('random-user-agent');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('133d207767f44d8a9c2b5f5e0f660155');

module.exports = {
    async readSource(file) {
        console.log(`READ DATA SOURCE ${file}`);
        let raw = await fs.readFile(file);
        let data = JSON.parse(raw);

        console.log(`FOUND ${data.articles.length} ARTICLES`);
        return data.articles;
    },
    async getContent(articles) {
        let data = [];

        for (let article of articles) {
            try {
                // request html response from article url
                console.log(`GET response from: ${article.url}`);
                const response = await request(article.url, {
                    headers: {
                        'User-Agent': randomUserAgent('desktop')
                    }
                });

                // if request have html response
                if (response) {
                    // read html content from response, make it clean
                    console.log(`EXTRACT ${article.url}`);
                    const extractData = extractor(response.body);

                    // if extracted data have description or content
                    if (extractData.description) {
                        // save extracted data to array
                        console.log(`SAVE ${extractData.title}`);
                        // console.log(extractData.text);
                        data.push(JSON.stringify(extractData));
                    }
                }
            } catch (error) {
                console.error(error);
                console.error(`cannot get response from ${article.url}`);
            }
        }

        // save content to json file
        try {
            const dir = './files/data.json';

            // wait until save to json file is successfully
            console.log(`save all content data to: ${dir}`);
            await fs.outputJSON(dir, data);

            return data;
        } catch (error) {
            console.error(error);
            console.error('cannot save data to json file.');
        }
    }
}