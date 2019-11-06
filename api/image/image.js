'use strict'

const puppeteer = require('puppeteer');
const randomUserAgent = require('random-user-agent');
const clean = require('../../utl/clean');
const fs = require('fs-extra');
const path = require('path');
const download = require('image-downloader');
const Jimp = require('jimp');
const request = require('async-request');
const cheerio = require('cheerio');

module.exports = {
    async search({
        keyword,
        limit = 100,
        puppeteerOptions = {},
        advanced = {}
    }) {
        if (keyword === undefined) {
            throw new Error('no keyword provided');
        }

        let searchBase = 'https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X';
        let userAgent = randomUserAgent('desktop');
        let query = searchBase;

        if (advanced) {
            let build = [];

            if (advanced.resolution) {
                build.push('isz:' + advanced.resolution);
            }

            if (advanced.imgType) {
                build.push('itp:' + advanced.imgType);
            }

            if (advanced.color) {
                build.push('ic:' + advanced.color);
            }

            build = build.length > 1 ? build.join(',') : build[0];

            query += '&tbs=' + build;
        }

        const browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.goto(query.replace('%', encodeURIComponent(keyword)));
        await page.addScriptTag({
            path: __dirname + '/jquery-3.4.1.min.js'
        })
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.setUserAgent(userAgent);

        const results = await page.evaluate((limit) => {
            return new Promise((resolve) => {
                let results = [];
                setInterval(() => {
                    // see if we have any results
                    $('.rg_l').each((index, element) => {
                        // check if we reached the limit
                        if (results.length >= limit) {
                            return resolve(results);
                        }

                        var meta = JSON.parse($(element).parent().find('.rg_meta').text());
                        var item = {
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

                        if (!results.filter(result => result.url === item.url).length) {
                            results.push(item);
                        }
                    });

                    // check if we reached the bottom, if so exit
                    if (($(window).scrollTop() + $(window).height() == $(document).height()) &&
                        !$('.ksb._kvc').is(':visible')) {
                        return resolve(results);
                    }

                    // scroll
                    $('html, body').animate({
                        scrollTop: $(document).height()
                    }, 1000);
                    let button = $('.ksb._kvc');
                    if (button) {
                        $.data(document, 'finished', false);
                        button.click();
                    }
                }, 1000);
            });
        }, limit);

        await browser.close();

        console.log(`FOUND ${results.length} links`);
        return results;
    },
    async download({
        keyword,
        results
    }) {
        let dir = `./files/contents/${clean.stripWord(keyword)}`;
        let downloadedFile = [];

        fs.ensureDirSync(dir)

        for (let result of results) {
            if (result.type == 'jpg' || result.type == 'png') {
                let imgTitle = clean.cleanWord(result.title)
                let imgAlt = clean.stripWord(imgTitle)
                let imgFilename = imgAlt + '.' + result.type;

                const options = {
                    url: result.url,
                    dest: `${dir}/${imgFilename}`,
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
            await Promise.all(
                images.map(async imgPath => {
                    const image = await Jimp.read(imgPath);
                    await image.resize(width, height);
                    await image.quality(quality);
                    await image.writeAsync(imgPath);
                })
            );
        } catch (error) {
            console.log(error);
        }
    },
    async searchImageLinks(keyword) {
        let baseURL = `https://www.google.com/search?q=${keyword}&source=lnms&tbm=isch&sa=X&tbs=itp:photo`;

        let response = await request(baseURL, {
            headers: {
                'User-Agent': randomUserAgent('desktop')
            }
        });

        let $ = cheerio.load(response.body);
        let results = [];

        $('.rg_l').each((index, element) => {
            // check if we reached the limit
            // if (results.length >= limit) {
            //     return resolve(results);
            // }

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

        console.log(`FOUND ${results.length} links`);

        return results;
    }
}