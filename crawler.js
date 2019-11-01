"use strict"

const say = require('say')
const path = require('path')

const downloadContent = async () => { 
    const text = `1. Check your hair and skin products
Hair conditioners, gels, pomades, shaving products, cosmetics, moisturizers, sunscreens, and other products that contain oil can clog your pores and cause a breakout. Simply switching to hair and skin products that don't clog pores—called "noncomedogenic"—could make a big difference in the appearance of your skin.

Check the labels on your hair and skin products to see if they are marked oil-free and noncomedogenic. Also, consider whether you truly need every product you use. Even products marked "dermatologist tested" can cause acne for some people. Minimizing the number of products you use may help further reduce outbreaks. And when you exercise, wear as little makeup as possible. Even oil-free and noncomedogenic cosmetics can clog pores if worn during heavy, sweaty exercise.`

    // Export spoken audio to a WAV file
    say.export(text, 'Microsoft Zira Desktop', 0.90, path.join(__dirname, 'hal.wav'), (err) => {
        if (err) {
            return console.error(err)
        }

        console.log('Text has been saved to hal.wav.')
        return result
    })
}

(async () => {
    const contents = await downloadContent();

    console.log('result:', contents);
})();