const robots = {
  input: require('./robots/input.js'),
  text: require('./robots/text.js'),
}

async function start(){

  robots.input()
  await robots.text(content)
  //console.log('To the next step...')
  //console.log('Exiting Program...')

  console.log(content)
}

start()