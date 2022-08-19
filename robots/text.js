// const algorithmia = require('algorithmia')
// const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const state = require('./state.js')

async function robot() {
    console.log('> [text-robot] Starting...')
    const content = state.load()
    console.log(content)
 
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    state.save(content)
    console.log('Build Sentences')

    /*
    *
    * Com o Robo da Wikipedia não precisamos utilizar o Algorithmia e usar nossos credito no mesmo.
    * 
    * Assim sendo passo diretamente os valores para o robo de texto e utlizo o que o robo do Wikipedia retornou para mim
    * 
    */
    // async function fetchContentFromWikipedia(content) {
    //   const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    //   const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    //   const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
    //   const wikipediaContent = wikipediaResponde.get()

    //   content.sourceContentOriginal = wikipediaContent.content
    // }

    // function sanitizeContent(content) {
    //     const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.wikiPediaContent.content)
    //     const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    //     content.wikiPediaContent.sourceContentSanitized = withoutDatesInParentheses

    //     function removeBlankLinesAndMarkdown(text) {
    //         const allLines = text.split('\n')

    //         const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
    //             if (line.trim().length === 0 || line.trim().startsWith('=')) {
    //                 return false
    //             }

    //             return true
    //         })

    //         return withoutBlankLinesAndMarkdown.join(' ')
    //     }
    // }
    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.wikiPediaContent.content)// content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        console.log(content)

        //content.sourceContentSanitized = withoutDatesInParentheses
        content.wikiPediaContent.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.wikiPediaContent.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

}

module.exports = robot
/******************************
const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    //breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        //console.log('Recebi com sucesso ${content.searchTerm}')
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        console.log(wikipediaContent)

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                return false
                }

            return true
        })
        
        return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }
}

module.exports = robot
*/