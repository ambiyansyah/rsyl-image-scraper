'use strict'

const fs = require('fs-extra');
const download = require('image-downloader');
const randomUserAgent = require('random-user-agent');
const say = require('say');

module.exports = {
    async prepareDirectories(contentTitle) {
        try {
            let titleSlug = await this.stripWord(contentTitle);
            let dirImage = `./files/contents/${titleSlug}/images`;
            let dirAudio = `./files/contents/${titleSlug}/audio`;
            let dirVideo = `./files/contents/${titleSlug}/video`;

            await fs.ensureDir(dirImage);
            await fs.ensureDir(dirAudio);
            await fs.ensureDir(dirVideo);

            return {
                dirImage,
                dirAudio,
                dirVideo
            }
        } catch (error) {
            console.error(error);
        }
    },
    async cleanWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').toLowerCase();
        } catch (error) {
            console.log(error);
        }
    },
    async stripWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').replace(/\s+/g, '-').toLowerCase();
        } catch (error) {
            console.log(error);
        }
    },
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    async downloadImage(url, destination) {
        try {
            console.log(`START DOWNLOAD ${url}`);
            const {
                filename,
                image
            } = await download.image({
                url: url,
                dest: destination,
                headers: {
                    'User-Agent': randomUserAgent('desktop')
                },
                timeout: 60000
            });

            console.log(`FINISH DOWNLOAD ${url}`);

            return filename
        } catch (error) {
            console.log(error)
        }
    },
    textToVoice(contentText, directories) { 
        return new Promise((resolve, reject) => { 
           let dest = `${directories.dirAudio}/audio.wav`;

           say.export(contentText, 'Microsoft Zira Desktop', 0.9, dest, (err) => {
               if (err) {
                   reject(err);
               }

               resolve(`text has been saved to ${dest}`);
           });
        });
    }
}