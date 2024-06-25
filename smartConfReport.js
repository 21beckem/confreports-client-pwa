let pageToLoad = new URLSearchParams(window.location.search).get('page');
let confTilesBox = document.getElementById('confTilesBox');
let pageConfs = collectedConferences[pageToLoad];

if (pageToLoad.includes('-full')) {
    pageToLoad = pageToLoad.split('-full')[0];
    
    // first grab that conference, then create the page
    fetch('https://21beckem.github.io/conference-data/' + pageToLoad + '-full.json')
        .then(res => res.json())
        .then(res => {
            // flatten sessions and put in same format as whole conf page
            let talksList = new Array();
            let idCounter = 0;
            for (let i=0; i < res.sessions.length; i++) {
                const thisSession = res.sessions[i];
                for (let j=0; j < thisSession.talks.length; j++) {
                    const thisTalk = thisSession.talks[j];
                    thisTalk.id = 'talkId_' + idCounter;
                    thisTalk.data = thisTalk.talkText;
                    talksList.push(thisTalk);
                    idCounter++;
                }
            }
            pageConfs = talksList;
            createPageTiles();
        })
} else {
    createConferencePage();
}


function createConferencePage() {
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

        let resultsOpacity = 0;
        let resultsNumber = 0;
        // if searching, do the search
        if (searchTerm != '') {
            resultsOpacity = 1;
            resultsNumber = searchConfrence(searchTerm, wholeWord, thisConf.data);
        }

        // if this is actually just one talk, not a conference
        let isTalk = '';
        if (thisConf.speaker) {
            isTalk = 'isTalk';
            thisDate = thisConf.title;
            imgLink = thisConf.img;
        } else {
            thisDate = (thisDate[1].includes('10') ? 'October' : 'April') + ' ' + thisDate[0];
        }

        // create the tile
        output += `
        <div id="tile_${confId}" class="tileBox ${isTalk}" style="background-image: url(${imgLink});" onclick="window.location.href = 'conf-smart-report.html?page=${confId}-full';">
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
    if (!confData.sessions) {
        // if given 1 talk text, not a conference
        return (confData.toLowerCase().match(regex) || []).length;
    }
    for (let i = 0; i < confData.sessions.length; i++) {
        const thisSession = confData.sessions[i];
        for (let j = 0; j < thisSession.talks.length; j++) {
            const thisTalk = thisSession.talks[j];
            runningTotal += (thisTalk.talkText.toLowerCase().match(regex) || []).length
        }
    }
    return runningTotal;
}