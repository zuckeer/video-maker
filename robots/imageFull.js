const imageDownloader = require('image-downloader')
const gm = require('gm').subClass({ imageMagick: true })
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const path = require('path')
const rootPath = path.resolve(__dirname, '..')

const fromRoot = relPath => path.resolve(rootPath, relPath)

const googleSearchCredentials = require('../credentials/google-search.json')
const { sentences } = require('sbd')

async function robot() {

    const content = state.load()

    //await fetchImagesOfAllSentences(content)
    console.log('Robô de imagens: Iniciando os trabalhos...')
    //await downloadAllImages(content)
    await convertAllImages(content)


    //state.save(content)

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
                    await downloadAndSave(imageUrl, sentenceIndex, '-original.png')
                    console.log('[', sentenceIndex, ']', '[', imageIndex, ']', '> Baixou a imagem com sucesso: ', imageUrl)
                    break
                } catch (error) {
                    console.log('> Erro ao baixar %s: $s', imageUrl, error)
                }
                imageIndex++
            }
            sentenceIndex++
        }
    }

    async function downloadAndSave(url, filename) {
        return imageDownloader.image({
            url, url,
            dest: '../../content/', filename
        })
    }

    async function convertAllImages(content) {
        console.log('Convertendo imagens...')
        let sentenceIndex = 0
        for (const counter of content.sentences) {
            const images = content.sentences[sentenceIndex].images

            await convertImage(sentenceIndex)
            sentenceIndex++
        }

        async function convertImage(sentenceIndex) {
            console.log('Iniciando...')
            return new Promise((resolve, reject) => {
                const inputFile = `./content/${sentenceIndex}-original.jpg[0]`
                //const inputFile  = '../../content/', sentenceIndex, '_original.png[0]'
                const outputFile = `./content/${sentenceIndex}-converted.jpg`
                //const outputFile = '../../content/', sentenceIndex, '_converted.png[0]'
                const width = 1920
                const height = 1080

                gm()
                    .in(inputFile)
                    .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-blur', '0x9')
                    .out('-resize', `${width}x${height}^`)
                    .out(')')
                    .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-resize', `${width}x${height}`)
                    .out(')')
                    .out('-delete', '0')
                    .out('-gravity', 'center')
                    .out('-compose', 'over')
                    .out('-composite')
                    .out('-extent', `${width}x${height}`)
                    .write(outputFile, (error) => {
                        if (error) {
                            return reject(error)
                        }

                        console.log(`> [video-robot] Image converted: ${outputFile}`)
                        resolve()
                    })
            })
        }


        async function convertImageDepois(sentenceIndex) {
            return new Promise((resolve, reject) => {
                const inputFile = fromRoot(`./content/${sentenceIndex}-original.png[0]`)
                const outputFile = fromRoot(`./content/${sentenceIndex}-converted.png`)
                const width = 1920
                const height = 1080

                gm()
                    .in(inputFile)
                    .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-blur', '0x9')
                    .out('-resize', `${width}x${height}^`)
                    .out(')')
                    .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-resize', `${width}x${height}`)
                    .out(')')
                    .out('-delete', '0')
                    .out('-gravity', 'center')
                    .out('-compose', 'over')
                    .out('-composite')
                    .out('-extent', `${width}x${height}`)
                    .write(outputFile, (error) => {
                        if (error) {
                            return reject(error)
                        }

                        console.log(`> [video-robot] Image converted: ${outputFile}`)
                        resolve()
                    })

            })
        }
    }
}

module.exports = robot