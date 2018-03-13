/* jshint esnext:true */
const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const FILE_DEST  = process.argv[2];

async function getAvailableTickets() {
    const response = await fetch('https://www.geekevents.org/shop/api/products/185/', {
        headers: {
            'User-Agent': 'marikollan-bot/1.0 (+http://marikollan.no/bot.html)',
            Accept: 'text/html',
            Referer: 'https://www.geekevents.org/mklan2017/shop/',
        }
    });

    const data = await response.json();

    return data.data[0].realAvailableCount;
}

async function outputToDestination(availableTickets) {
    let output = availableTickets.toString();

    if (FILE_DEST) {
        return writeFile(FILE_DEST, output);
    }
    else {
        process.stdout.write(output);
    }
}

getAvailableTickets()
.then(availableTickets => outputToDestination(availableTickets))
.then(() => process.exit(0))
.catch(err => {
    console.error(err);
    process.exit(1);
})
