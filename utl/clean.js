'use strict'

module.exports = {
    cleanWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').toLowerCase()
        } catch (e) {
            return 'default'
        }
    },
    stripWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').replace(/\s+/g, '-').toLowerCase()
        } catch (error) {
            return 'default'
        }
    }
}