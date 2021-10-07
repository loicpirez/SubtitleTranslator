#!/usr/bin/env node

// node src/index.js zh-CN ./sample.srt fr

const fs = require('fs');
const parser = require('subtitles-parser-vtt');

const config = require('dotenv').config()

if (config.parsed.GOOGLE_APPLICATION_CREDENTIALS === undefined) {
    console.error("Error: Env variable GOOGLE_APPLICATION_CREDENTIALS have not been set.")
    process.exit(1)
}

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();

// ARGUMENTS

const args = process.argv.slice(2);

const targetLanguage = args[0]
const srtFile = args[1]
const mergedLanguage = args[2] // Optional

if (args.length <= 1) {
    console.info('Usage:')
    console.info('$ node src/index.js [targetLanguage] [srtFileLocation]')
    console.info('$ node src/index.js [targetLanguage] [srtFileLocation] [mergedLanguage]')
    console.info('Exemple:')
    console.info('$ node src/index.js zh-CN ./sample.srt')
    console.info('$ node src/index.js zh-CN ./sample.srt fr')
    process.exit(1)
}


const srt = fs.readFileSync(srtFile,'utf8');
const data = parser.fromVtt(srt);
const mergedLanguagedEnabled = mergedLanguage !== undefined

async function subtitleTranslation() {
    let translatedSubtitle = data;

    let index = 0
    for (value in translatedSubtitle) {
        let translation = await translate.translate(data[index].text, targetLanguage);
        let mergedTranslation = ''

        if (mergedLanguagedEnabled) {
            mergedTranslation = await translate.translate(data[index].text, mergedLanguage);
            translation = translation[0] + '\n' + mergedTranslation[0]
        }
        else {
            translation = translation[0]
        }

        data[index].text = translation;

        index += 1

    }

    console.log(parser.toVtt(data))

}

subtitleTranslation();
