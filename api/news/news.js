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
const extractor = require('unfluff');
const request = require('async-request');
const axios = require('axios');

module.exports = {
    async getNews(file) {
        let rawdata = fs.readFileSync(file);
        let articles = JSON.parse(rawdata);

        return articles.articles;
    },
    async getContent(articles) {
        let data = {};

        for (let article of articles) { 
            try {
                const response = await axios.get(article.url);
                
                if (response) {
                    const extractData = extractor(response.data);

                    if (extractData.description) {
                        data[extractData.title] = extractData;
                    }
                }
            } catch (error) {
                console.error(error);
                console.error(`cannot get response from ${article.url}`);
            }
        }
        
        try {
            const dir = './files/news/data.json';

            await fsExtra.outputJSON(dir, data);

            return data;
        } catch (error) {
            console.error(error);
            console.error('cannot save data to json file.');
        }
    }
}