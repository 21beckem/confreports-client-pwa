// start the loader right away
MobileGrapher.setLoader('myGraph');

// get all the data for me to start working
let urlPrms = new URLSearchParams(window.location.search);
const formData = {
    strtMon  : urlPrms.get('strtMon'),
    strtYer : urlPrms.get('strtYer'),
    stopMon : urlPrms.get('stopMon'),
    stopYer : urlPrms.get('stopYer'),
    phraseToSearch : urlPrms.get('phraseToSearch')
}
const formData_formated = {
    strtMon  : (urlPrms.get('strtMon') == 'April') ? '04' : '10',
    strtYer : parseInt(urlPrms.get('strtYer')),
    stopMon : (urlPrms.get('stopMon') == 'April') ? '04' : '10',
    stopYer : parseInt(urlPrms.get('stopYer')),
    phraseToSearch : urlPrms.get('phraseToSearch')
}
//console.log(formData_formated);
//console.log(collectedConferences);
let flatList = collectedConferences_flatten().map(x => [parseInt(x.split('-')[0]), x.split('-')[1]] );
flatList = flatList.filter(x => x[0] >= formData_formated.strtYer && x[0] <= formData_formated.stopYer);
if (formData_formated.strtMon == '10' && flatList[flatList.length - 1][1] == '04') { flatList.pop(); }
if (formData_formated.stopMon == '04' && flatList[0][1] == '10') { flatList.shift(); }
//console.log(flatList);

let AL = new searchAlgorithm();
async function main() {
    
    // make array for stored conferences
    let storedConferences = [];

    // fetch each conference
    for (let i = 0; i < flatList.length; i++) {
        const thisConfId = flatList[i][0] + '-' + flatList[i][1];
        const confData = fetch('https://21beckem.github.io/conference-data/' + thisConfId + '-full.json').then(res => res.json()).then(res => AL.searchConfrence(formData.phraseToSearch, res));
        storedConferences.push(confData);
    }

    // wait for all of them
    for (let i = 0; i < storedConferences.length; i++) {
        storedConferences[i] = await storedConferences[i];
    }
    console.log(AL.founds);

    // init mobile grapher
    new MobileGrapher('myGraph', {
        bars: [...flatList].map(x => (x[1]=='04' ? 'April' : 'October') + '<br>' + x[0]),
        vals: storedConferences,
    });

    // fill in found words if needed  </td><td>Word</td><td>100</td></tr>
    if (formData_formated.phraseToSearch.includes('*')) {
        document.getElementById('foundWordsPanel').querySelector('.foundWordsTable').innerHTML =
            Object.entries(AL.founds).sort((a, b) => b[1] - a[1])
            .map(([key, val]) => `<key>${key}</key><val>${val}</val>`).join('');
        document.getElementById('foundWordsPanel').style.display = 'unset';
    }
}
main();