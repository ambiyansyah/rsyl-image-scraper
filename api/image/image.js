'use strict'

const puppeteer = require('puppeteer');
const randomUserAgent = require('random-user-agent');
const fs = require('fs-extra');
const path = require('path');
const download = require('image-downloader');
const Jimp = require('jimp');
const request = require('async-request');
const cheerio = require('cheerio');
const utils = require('./../../utils/utils');

module.exports = {
    // async search({
    //     keyword,
    //     limit = 100,
    //     puppeteerOptions = {},
    //     advanced = {}
    // }) {
    //     if (keyword === undefined) {
    //         throw new Error('no keyword provided');
    //     }

    //     let searchBase = 'https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X';
    //     let userAgent = randomUserAgent('desktop');
    //     let query = searchBase;

    //     if (advanced) {
    //         let build = [];

    //         if (advanced.resolution) {
    //             build.push('isz:' + advanced.resolution);
    //         }

    //         if (advanced.imgType) {
    //             build.push('itp:' + advanced.imgType);
    //         }

    //         if (advanced.color) {
    //             build.push('ic:' + advanced.color);
    //         }

    //         build = build.length > 1 ? build.join(',') : build[0];

    //         query += '&tbs=' + build;
    //     }

    //     const browser = await puppeteer.launch(puppeteerOptions);
    //     const page = await browser.newPage();
    //     await page.goto(query.replace('%', encodeURIComponent(keyword)));
    //     await page.addScriptTag({
    //         path: __dirname + '/jquery-3.4.1.min.js'
    //     })
    //     await page.setViewport({
    //         width: 1920,
    //         height: 1080
    //     });
    //     await page.setUserAgent(userAgent);

    //     const results = await page.evaluate((limit) => {
    //         return new Promise((resolve) => {
    //             let results = [];
    //             setInterval(() => {
    //                 // see if we have any results
    //                 $('.rg_l').each((index, element) => {
    //                     // check if we reached the limit
    //                     if (results.length >= limit) {
    //                         return resolve(results);
    //                     }

    //                     var meta = JSON.parse($(element).parent().find('.rg_meta').text());
    //                     var item = {
    //                         title: meta.pt,
    //                         alt: meta.st,
    //                         host: meta.rh,
    //                         type: meta.ity,
    //                         width: meta.ow,
    //                         height: meta.oh,
    //                         url: meta.ou,
    //                         thumb_url: meta.tu,
    //                         thumb_width: meta.tw,
    //                         thumb_height: meta.th
    //                     };

    //                     if (!results.filter(result => result.url === item.url).length) {
    //                         results.push(item);
    //                     }
    //                 });

    //                 // check if we reached the bottom, if so exit
    //                 if (($(window).scrollTop() + $(window).height() == $(document).height()) &&
    //                     !$('.ksb._kvc').is(':visible')) {
    //                     return resolve(results);
    //                 }

    //                 // scroll
    //                 $('html, body').animate({
    //                     scrollTop: $(document).height()
    //                 }, 1000);
    //                 let button = $('.ksb._kvc');
    //                 if (button) {
    //                     $.data(document, 'finished', false);
    //                     button.click();
    //                 }
    //             }, 1000);
    //         });
    //     }, limit);

    //     await browser.close();

    //     console.log(`FOUND ${results.length} links`);
    //     return results;
    // },
    async download(keyword, results) {
        const keywordSlug = await utils.stripWord(keyword);
        const dir = `./files/contents/${keywordSlug}/images`;

        // fs.ensureDirSync(dir)
        await fs.ensureDir(dir);

        let downloadedFile = [];
        for (let result of results) {
            if (result.type == 'jpg' || result.type == 'png') {
                const imageTitle = await utils.cleanWord(result.title);
                const imageAlt = await utils.stripWord(imageTitle);
                const imageFilename = `${imageAlt}.jpg`;
                const destination = `${dir}/${imageFilename}`;

                const options = {
                    url: result.url,
                    dest: destination,
                    headers: {
                        'User-Agent': randomUserAgent('desktop')
                    },
                    timeout: 60000
                }

                try {
                    console.log(`DOWNLOAD ${options.url}`);
                    const {
                        filename,
                        image
                    } = await download.image(options)

                    downloadedFile.push(filename)
                } catch (error) {
                    console.log(error)
                }
            }
        }

        await this.resize(downloadedFile, 800, Jimp.AUTO, 90);

        return downloadedFile;
    },
    async resize(images, width, height = Jimp.AUTO, quality) {
        try {
            console.log(`START RESIZE IMAGES`);
            await Promise.all(
                images.map(async imgPath => {
                    const image = await Jimp.read(imgPath);
                    await image.resize(width, height);
                    await image.quality(quality);
                    await image.writeAsync(imgPath);
                })
            );
            console.log(`FINISH RESIZE IMAGE`);
        } catch (error) {
            console.error(error);
        }
    },
    async searchImages(contentTitle) {
        try {
            // clean string
            let title = await utils.cleanWord(contentTitle);
            // set base url to use by request function
            let baseURL = `https://www.google.com/search?q=${title}&source=lnms&tbm=isch&sa=X&tbs=itp:photo`;
            console.info(baseURL);
            console.log(`START SEARCH IMAGES LINK FROM GOOGLE WITH KEYWORD : ${title}`);
            // get response from base url of google search
            let response = await request(baseURL, {
                headers: {
                    // use user agent from randomUserAgent package to avoid banned from google search
                    'User-Agent': randomUserAgent('desktop')
                }
            });
            
            // check if request get response successfully
            if (response.statusCode == 200 && response.body) {
                console.log(`SUCCESS GET RESPONSE FROM GOOGLE SEARCH AND COLLECT THE DATA`);
                // load html from response and make it works with jquery function
                let $ = cheerio.load(response.body);

                // declare results variable to collect data
                let results = [];

                // loop class rg_l
                $('.rg_l').each((index, element) => {
                    // find json data inside rg_meta class css
                    let meta = JSON.parse($(element).parent().find('.rg_meta').text());
                    let item = {
                        title: meta.pt,
                        alt: meta.st,
                        host: meta.rh,
                        type: meta.ity,
                        width: meta.ow,
                        height: meta.oh,
                        url: meta.ou,
                        thumb_url: meta.tu,
                        thumb_width: meta.tw,
                        thumb_height: meta.th
                    };

                    // if (!results.filter(result => result.url === item.url).length) {
                    //     results.push(item);
                    // }
                    results.push(item);
                });

                console.log(`COLLECT ${results.length} IMAGES LINK :)`);

                if (results.length < 10) {
                    console.log(`IMAGES LINK NOT ENOUGH, TRY SEARCH AGAIN`);
                    await utils.timeout(10000);
                    return this.searchImages(contentTitle);
                } else { 
                    return results;
                }
            } else { 
                console.error(`CANT GET RESPONSE FROM GOOGLE SEARCH`);
            }
        } catch (error) {
            console.error(error);
        }
    },
    async downloadImages(imageLinks, directories) { 
        let results = [];
        for (let image of imageLinks) { 
            try {
                console.log(`COLLECT DATA FOR DOWNLOAD FILE`);
                let url = image.url;
                let imageSlug = await utils.stripWord(image.title);
                let destination = `${directories.dirImage}/${imageSlug}.jpg`;

                // start download image
                let imageFile = await utils.downloadImage(url, destination);

                if (imageFile) {
                    results.push(imageFile);
                }
            } catch (error) {
                console.error(error);
            }
        }

        console.log(`FINISH DOWNLOAD ALL FILES`);
        return results;
    }
}