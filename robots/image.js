const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')
async function robot() {
    const content = state.load()

    const imagesArray = await fetchGoogleAndReturnImageLinks('Al Pacino')
    console.dir(imagesArray, {depth: null})
    process.exit(0)

    async function fetchGoogleAndReturnImageLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            //q: 'Al Pacino',
            q: query,
            searchType: 'image',
            num: 2
        })

        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })
        return imagesUrl
    }

}

module.exports = robot