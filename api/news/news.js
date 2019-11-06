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
const randomUserAgent = require('random-user-agent');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('133d207767f44d8a9c2b5f5e0f660155');

module.exports = {
    // getNews is function to read article data from json file that has been downloaded from newsAPI
    async getNews(file) {
        console.log(`READ ${file}`);
        let rawdata = await fsExtra.readFile(file);
        let articles = JSON.parse(rawdata);

        console.log(`FOUND ${articles.articles.length} articles`);
        return articles.articles;
    },
    // getContent is function to get content/html response from list article URL
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
                    console.log(`EXTRACT ${article.url}`)
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
            await fsExtra.outputJSON(dir, data);

            return data;
        } catch (error) {
            console.error(error);
            console.error('cannot save data to json file.');
        }
    },
    async generateAudio(file) {
        console.log(`OPEN DATA ${file}`);
        
        const raw = await fsExtra.readFile(file);
        const contents = JSON.parse(raw);
        
        for (let content of contents) {
            content = JSON.parse(content);
            const filename = utl.stripWord(content.title);
            const dir = await fsExtra.ensureDir(`./files/contents/${filename}`);

            if (dir) { 
                const location = `${dir}/${filename}.wav`;

                say.export(content.text, 'Microsoft Zira Desktop', 0.9, location, (err) => {
                    if (err) {
                        return console.error(err);
                    }

                    console.log(`Text has been saved to ${location}.`);
                });
            }
        }
    }
}