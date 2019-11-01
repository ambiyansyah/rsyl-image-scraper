'use strict'

module.exports = {
    async cleanWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').toLowerCase()
        } catch (e) {
            return 'default'
        }
    },
    async stripWord(word) {
        try {
            return word.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s\s+/g, ' ').replace(/\s+/g, '-').toLowerCase()
        } catch (error) {
            return 'default'
        }
    }
}