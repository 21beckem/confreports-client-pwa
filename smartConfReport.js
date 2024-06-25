const pageToLoad = new URLSearchParams(window.location.search).get('page');
let confTilesBox = document.getElementById('confTilesBox');

let pageConfs = collectedConferences[pageToLoad];

// create the tiles for this page
createPageTiles()

// start fetching each one of those conference data jsons
for (let i=1; i < pageConfs.length; i++) {
    const thisConfId = pageConfs[i];
    fetch('https://21beckem.github.io/conference-data/' + thisConfId + '-full.json')
        .then(res => res.json())
        .then(res => {
            pageConfs[i] = {
                'id' : pageConfs[i],
                'data' : res
            }
            // preload the thumbnail for that tile
            preloadImage(pageConfs[i].data.thumbnail, () => {
                // update the image for that tile
                document.getElementById('tile_' + pageConfs[i].id).style.backgroundImage = `url(${pageConfs[i].data.thumbnail})`;
            })
        })
}

// if on main page preload images for other pages
if (pageToLoad == 'main') {
    for (let i = 0; i < Object.keys(collectedConferences).length; i++) {
        const confPage = Object.keys(collectedConferences)[i];
        if (confPage != pageToLoad) {
            preloadImage(collectedConferences[confPage][0], () => {
                document.getElementById('page_' + confPage).style.backgroundImage = `url(${collectedConferences[confPage][0]})`;
            });
        }
    }
}

function preloadImage(url, callback) {
    if (url == '') {
        return;
    }
    const img = new Image();
    img.style.display = 'none';
    img.src = url;
    if (img.complete) {
        callback();
    } else {
        img.onload = () => {
            callback();
            img.remove();
        };
    }
}

function createPageTiles(searchTerm = '', wholeWord = false) {
    // create loader instead of just clearing the box
    confTilesBox.innerHTML = '<div class="loader"></div>';
    let output = '';
    for (let i=1; i < pageConfs.length; i++) {
        let thisConf = pageConfs[i];
        let confId = thisConf;
        let imgLink = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
        if (thisConf.id) {
            confId = thisConf.id;
            if (thisConf.data.thumbnail != '') {
                imgLink = thisConf.data.thumbnail;
            }
        }
        let thisDate = confId.split('-');
        thisDate = (thisDate[1].includes('10') ? 'October' : 'April') + ' ' + thisDate[0];

        let resultsOpacity = 0;
        let resultsNumber = 0;
        // if searching, do the search
        if (searchTerm != '') {
            resultsOpacity = 1;
            resultsNumber = searchConfrence(searchTerm, wholeWord, thisConf.data);
        }

        // create the tile
        output += `
        <div id="tile_${confId}" class="tileBox" style="background-image: url(${imgLink});">
            <div class="tileResults" style="opacity:${resultsOpacity};">
                <span>${resultsNumber}</span>
                <span>References</span>
            </div>
            <div class="tileBottom">
                <span>${thisDate}</span>
            </div>
        </div>`
    }
    
    // if this is the main page, make tiles for other pages
    if (pageToLoad == 'main') {
        for (let i = 0; i < Object.keys(collectedConferences).length; i++) {
            const confPage = Object.keys(collectedConferences)[i];
            if (confPage != pageToLoad) {
                output += `
                <div id="page_${confPage}" class="tileBox" style="background-image: url(${collectedConferences[confPage][0]})" onclick="window.location.href = 'conf-smart-report.html?page=${confPage}';">
                    <div class="tileResults" style="opacity:0;">
                        <span>0</span>
                        <span>References</span>
                    </div>
                    <div class="tileBottom">
                        <span>${confPage}</span>
                    </div>
                </div>`
            }
        }
    }
    confTilesBox.innerHTML = output;
}

var timeoutID;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(searchConferences, 500);
});

function searchConferences() {
    let searchTerm = document.getElementById('searchInput').value;
    let wholeWord = false;
    createPageTiles(searchTerm, wholeWord);
}

function searchConfrence(searchTerm, wholeWord, confData) {
    let runningTotal = 0;
    let regex = new RegExp(searchTerm.toLowerCase(), "g");
    for (let i = 0; i < confData.sessions.length; i++) {
        const thisSession = confData.sessions[i];
        for (let j = 0; j < thisSession.talks.length; j++) {
            const thisTalk = thisSession.talks[j];
            runningTotal += (thisTalk.talkText.toLowerCase().match(regex) || []).length
        }
    }
    return runningTotal;
}