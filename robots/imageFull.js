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

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)
    await convertAllImages(content)
    await createAllSentencesImages(content)
    await createYouTubeThumbnail()

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
    async function createAllSentencesImages(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        }
    }

    async function createSentenceImage(sentenceIndex, sentenceText) {
        return new Promise((resolve, reject) => {
            const outputFile = fromRoot(`./content/${sentenceIndex}-sentence.png`)

            const templateSettings = {
                0: {
                    size: '1920x400',
                    gravity: 'center'
                },
                1: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                5: {
                    size: '800x1080',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }

            }

            gm()
                .out('-size', templateSettings[sentenceIndex].size)
                .out('-gravity', templateSettings[sentenceIndex].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log(`> [video-robot] Sentence created: ${outputFile}`)
                    resolve()
                })
        })
    }

    async function createYouTubeThumbnail() {
        return new Promise((resolve, reject) => {
            gm()
                .in(fromRoot('./content/0-converted.png'))
                .write(fromRoot('./content/youtube-thumbnail.jpg'), (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log('> [video-robot] YouTube thumbnail created')
                    resolve()
                })
        })
    }
}

module.exports = robot