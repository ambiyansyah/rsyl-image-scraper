"use strict"

const Scraper = require('./lib/google-images-scraper')
const argv = require('yargs').argv
const UserAgent = require('user-agents')
const download = require('image-downloader')
const fs = require('fs-extra')
const utl = require('./utl/clean')
const request = require('async-request')
const read = require('read-art')
const htmlToText = require('html-to-text')
const say = require('say')
const path = require('path')
const imageHandler = require('./handler/imageHandler')

require('dotenv').config()

const downloadImages = async (keyword, results, utl, ua) => {
    let dir = `./images/${ await utl.stripWord(keyword) }`;
    let downloadedFile = [];
    fs.ensureDirSync(dir)

    for (let result of results) {
        if (result.type) {
            let imgTitle = await utl.cleanWord(result.title)
            let imgAlt = await utl.stripWord(imgTitle)
            let imgFilename = imgAlt + '.' + result.type;

            const options = {
                url: result.url,
                dest: `${dir}/${imgFilename}`,
                headers: {
                    'User-Agent': ua.toString()
                }
            }

            try {
                console.log(`download ${result.url}`);
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

    return downloadedFile;
}

const getNews = async () => {
    newsapi.v2.sources({
        category: 'technology',
        language: 'en',
        country: 'us'
    }).then(response => {
        console.log(response);
        return response
    });
}

(async () => {
    let ua = new UserAgent()
    let keyword = await utl.cleanWord(argv.keyword)
    let google = new Scraper.Google({
        keyword: keyword,
        userAgent: ua.toString(),
        limit: argv.limit || 200,
        puppeteer: {
            headless: true
        },
        advanced: {
            imgType: process.env.IMG_TYPE,   // options: clipart, face, lineart, news, photo
            resolution: process.env.RESOLUTION,       // options: l(arge), m(edium), i(cons), etc.
            color: process.env.COLOR  // options: color, gray, trans
        }
    })

    const results = await google.start()
    const download = await downloadImages(keyword, results, utl, ua)

    console.log('results', download.length)
    // console.log(await getNews())
    // let url = 'https://mashable.com/article/joker-movie-review/'
    // let response

    // try {
    //     read('https://mashable.com/article/joker-movie-review/', function (err, art, options, resp) {
    //         if (err) {
    //             throw err;
    //         }

    //         console.log('[STATUS CODE]', resp && resp.statusCode)

    //         let title = art.title
    //         let content = art.content
    //         let html = art.html

    //         const text = htmlToText.fromString(content, {
    //             wordwrap: false,
    //             hideLinkHrefIfSameAsText: true,
    //             ignoreHref: true,
    //             ignoreImage: true,
    //             singleNewLineParagraphs: true
                
    //         });
    //         console.log(title)
    //         console.log(text)

    //         say.export(text, 'Microsoft Zira Desktop', 1, path.join(__dirname, `test.wav`), (err) => {
    //             if (err) {
    //                 return console.error(err)
    //             }

    //             console.log(`Text has been saved to test.wav.`)
    //         })
    //     });
    // } catch (error) {
    //     console.log(error)
    // }
})()