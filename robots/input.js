const Parser = require('rss-parser');
const unicode = require('unidecode');
const readline = require('readline-sync')
const state = require('./state.js')
const wikipedia = require('./wikipedia.js')
const gTrends = require('./gTrends.js')

async function robot() {
    const content = {maximumSentences: 7}
    //const content =  {}
    const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 
  
    content.searchTerm = await askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.wikiPediaContent = await wikipedia(content) //retirado prefixo robots da chamada.

    //content.searchTerm = askAndReturnSearchTerm()
    //content.prefix = askAndReturnPrefix()
    state.save(content)

    async function askAndReturnSearchTerm () {
        const response = readline.question('Type a Wikipedia search term or G to fetch google trends: ')

        const value = (response.toUpperCase() === 'G') ?  await askAndReturnTrend() : response
        if(!value){
        console.log('You don\'t defined any search term...')
        console.log('Exiting Program...')
        process.exit()
        }
        return value

    }
    function askAndReturnPrefix(){
        const prefix = ['Who is','What is','The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefix, 'Choose one option: ')
        //const selectedPrefixIndex = readline.keyInSelect(prefix,'Choose an option for \''+unicode(content.searchTerm)+' \':')
        const selectedPrefixText = prefix[selectedPrefixIndex]
        if(!selectedPrefixText){
        console.log('You don\'t defined a option for your term...')
        console.log('Exiting Program...')
        process.exit()
        }
        return selectedPrefixText
    }
    async function askAndReturnTrend() {
        console.log('Please Wait...')
        const trends = await getGoogleTrends()
        const trendsB = trends.items.map(i => i.title.toString('utf8'))
        trends = trends.items.map(i => unicode(i.title.toString('utf8')))
        const choice = readline.keyInSelect(trends, 'Choose your trend:')
    
        return trendsB[choice] 
    }
    
    async function getGoogleTrends () {
        const parser = new Parser();
        const trends = await parser.parseURL(TREND_URL);
        return trends
    }

}

module.exports = robot