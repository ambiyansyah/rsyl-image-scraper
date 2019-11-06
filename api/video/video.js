'use strict'

const videoshow = require('videoshow');
const fsExtra = require('fs-extra');
const clean = require('./../../utl/clean');

module.exports = {
    async generate() { 
        const file = './files/data.json';
        const contents = JSON.parse(fsExtra.readFileSync(file));

        for (let content of contents) { 
            content = JSON.parse(content);
            const name = clean.stripWord(content.title);

            console.log(name);
        }
    }
}