// start the loader right away
MobileGrapher.setLoader('myGraph');
try { window.parent.setSubTitle('Conference Grapher'); } catch (e) {}

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
let storedConferences = [];
let myGrapher;
let myLineGrapher;

async function fetchConfrences() {
    // fetch each conference
    for (let i = 0; i < flatList.length; i++) {
        const thisConfId = flatList[i][0] + '-' + flatList[i][1];
        const confData = fetch('https://21beckem.github.io/conference-data/' + thisConfId + '-full.json')
            .then(res => res.json());
        storedConferences.push(confData);
    }
    // wait for all of them
    for (let i = 0; i < storedConferences.length; i++) {
        storedConferences[i] = await storedConferences[i];
    }
}

async function searchConfrences() {
    let confVals = Array(storedConferences.length);
    for (let i = 0; i < storedConferences.length; i++) {
        confVals[i] = AL.searchConfrence(formData_formated.phraseToSearch, storedConferences[i]);
    }
    return confVals;
}

function createGraph(vals) {
    const GraphLabels = [...flatList].map(x => (x[1]=='04'?'Apr ':'Oct ') + x[0]).reverse();
    const GraphLinks = [...flatList].map(x => x.join('-')).reverse();

    myGrapher.data = {
        bars: GraphLabels,
        vals: vals,
        links: GraphLinks,
        link_callback: async (thisLink) => {
            if ( await JSAlert.confirm('Do you want to inspect this conference?') ) {
                sessionStorage.setItem('lastSearchTerm', formData_formated.phraseToSearch);
                window.location.href = `smart-report.html?pg=conf&page=${thisLink}-full`;
            }
        }
    };
    myGrapher.graph();

    console.log(GraphLinks[1]);
    

    myLineGrapher.data = {
        labels: GraphLabels,
        datasets: [{
            label: 'Conferences',
            data: vals.reverse(),
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--mid-tone'),
            tension: 0.2
        }]
    };
    myLineGrapher.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: Math.round( Math.max(...vals) * 1.5 )
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        onClick: async (event, elements) => {
            if (elements.length > 0) {
                const thisLink = GraphLinks[ elements[0].index ];

                if ( await JSAlert.confirm('Do you want to inspect this conference?') ) {
                    sessionStorage.setItem('lastSearchTerm', formData_formated.phraseToSearch);
                    window.location.href = `smart-report.html?pg=conf&page=${thisLink}-full`;
                }
            }
        }
    }
    myLineGrapher.update();
}

async function init() {
    await fetchConfrences();
    let confVals = await searchConfrences();
    myGrapher = new MobileGrapher('myGraph', {}, false);
    myGrapher.createGraphBody();
    myLineGrapher = new Chart(document.getElementById('myLineGraph'), {
        type: 'line'
    });
    createGraph(confVals);

    // fill in found words if needed
    if (formData_formated.phraseToSearch.includes('*')) {
        let listParent = document.getElementById('foundWordsPanel').querySelector('.foundWordsTable');
        listParent.innerHTML = '';
        Object.entries(AL.founds).sort((a, b) => b[1] - a[1]).forEach(([key, val], i) => {
            listParent.innerHTML += `<row onclick="this.firstElementChild.click()"><input class="FoundWordscheckbox" id="chk-${i}" key="${key}" type="checkbox" checked><key>${key}</key><val>${val}</val></row>`;
        });
        listParent.childNodes.forEach(row => {
            row.firstElementChild.addEventListener('click', async () => {
                if (row.firstElementChild.checked) {
                    AL.removeException(row.firstElementChild.getAttribute('key'));
                    let confVals = await searchConfrences();
                    createGraph(confVals);
                } else {
                    AL.addException(row.firstElementChild.getAttribute('key'));
                    let confVals = await searchConfrences();
                    createGraph(confVals);
                }
            });
        })
        document.getElementById('foundWordsPanel').style.display = 'unset';
    }
}
init();