'use strict'

const videoshow = require('videoshow');
const fsExtra = require('fs-extra');
const clean = require('./../../utl/clean');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const utils = require('./../../utils/utils');

module.exports = {
    async generate() { 
        const file = './files/data.json';
        const contents = JSON.parse(fsExtra.readFileSync(file));

        let count = 0;
        for (let content of contents) { 
            if (count == 1) { 
                await this.generateSingleVideo(content);
            }

            count++;
        }
    },
    async generateSingleVideo(content) { 
        content = JSON.parse(content);

        const keywordSlug = clean.stripWord(content.title);

        let images = [];
        try {
            const imageFiles = fsExtra.readdirSync(`./files/contents/${keywordSlug}/images`);

            for (let imageFile of imageFiles) {
                const buffer = readChunk.sync(`./files/contents/${keywordSlug}/images/${imageFile}`, 0, fileType.minimumBytes);

                if (fileType(buffer) && fileType(buffer).ext == 'jpg') {
                    images.push(`./files/contents/${keywordSlug}/images/${imageFile}`);
                }
            }
        } catch (error) {
            console.log(error);
        }

        let audio = '';
        try {
            audio = `./files/contents/${keywordSlug}/audio/${keywordSlug}.wav`;
        } catch (error) {
            console.log(error);
        }

        let videoOptions = {
            fps: 25,
            loop: 5, // seconds
            transition: true,
            transitionDuration: 1, // seconds
            videoBitrate: 1024,
            videoCodec: 'libx264',
            size: '640x?',
            audioBitrate: '128k',
            audioChannels: 2,
            format: 'mp4',
            pixelFormat: 'yuv420p'
        }

        if (images.length && audio) {
            console.log(`CREATE VIDEO ${keywordSlug}.mp4`);
            videoshow(images, videoOptions)
                // .audio(audio)
                .save(`${keywordSlug}.mp4`)
                .on('start', function (command) {
                    console.log('ffmpeg process started:', command)
                })
                .on('error', function (err, stdout, stderr) {
                    console.error('Error:', err)
                    console.error('ffmpeg stderr:', stderr)
                })
                .on('end', function (output) {
                    console.error('Video created in:', output)
                })
        }
    },
    async create(content, imagefiles, directories) {
        try {
            let filename = await utils.stripWord(content.title);
            let videoOptions = {
                fps: 25,
                loop: 5,
                transition: true,
                transitionDuration: 1,
                videoBitrate: 1024,
                videoCodec: 'libx264',
                size: '640x?',
                audioBitrate: '128k',
                audioChannels: 2,
                format: 'mp4',
                pixelFormat: 'yuv420p'
            }

            videoshow(imagefiles, videoOptions)
                .audio(`${directories.dirAudio}/audio.wav`)
                .save(`${directories.dirVideo}/${filename}.mp4`)
                .on('start', function (command) {
                    console.log('ffmpeg process started:', command)
                })
                .on('error', function (err, stdout, stderr) {
                    console.error('Error:', err)
                    console.error('ffmpeg stderr:', stderr)
                })
                .on('end', function (output) {
                    console.log('Video created in:', output)
                });
        } catch (error) {
            console.log(error);
        }
    }
}