const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')
const { sentences } = require('sbd')

async function robot() {

    const content = state.load()
    
    await fetchImagesOfAllSentences(content)
    console.log('Robô de imagens: Iniciando os trabalhos...')
    await downloadAllImages(content)
    state.save(content)

    // const imagesArray = await fetchGoogleAndReturnImageLinks('Al Pacino')
    // console.dir(imagesArray, {depth: null})
    // process.exit(0)
    async function fetchImagesOfAllSentences(content) {  //o original eh fetchImagesOfAllSentences
        for (const sentence of content.sentences) { //o original eh content.sentences
            const query = '${content.searchTerm} ${sentence.keywords[0]}' //essa é a sentenca q monta a busca com as keywords
            sentence.images = await fetchGoogleAndReturnImageLinks(query)

            sentence.googleSearchQuery = query
        }
    }

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

    async function downloadAllImages(content) {
        content.downloadedImages = []

        //content.downloadedImages[0] = 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Manglehorn_03_%2815272211442%29.jpg'
        //console.log('Bora trabalhar karay...', content.sentences.lenght)
        let sentenceIndex = 0
        for (const counter of content.sentences) {
            const images = content.sentences[sentenceIndex].images
            //console.log(content.sentences[sentenceIndex])

            let imageIndex = 0
            for (const contador of images) {
                const imageUrl = images[imageIndex]
                console.log(content.downloadedImages.includes(imageUrl))

                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Imagem repetida.')
                    }
                    await downloadAndSave(imageUrl, sentenceIndex,'-original.png')
                    console.log('[',sentenceIndex,']','[',imageIndex,']', '> Baixou a imagem com sucesso: ', imageUrl)
                    break
                } catch (error) {
                    console.log('> Erro ao baixar %s: $s', imageUrl, error)
                }
                imageIndex++
            }
            sentenceIndex++
        }
    }

    async function downloadAndSave (url, filename) {
        return imageDownloader.image({
            url, url,
            dest: '../../content/', filename
        })
    }
}

module.exports = robot