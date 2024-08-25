let pageConfs;
const defaultConfImage = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
String.prototype.toTitleCase = function() {
    return this.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}
class DownloadWaiter {
    static awaiting = Array();
    static callback = function() {};
    static alreadyCompleted = false;
    static setCallback(newCallback) {
        this.callback = newCallback;
        if (this.alreadyCompleted) {
            this.callback();
        }
    }
    static add(toDownload) {
        this.awaiting.push(toDownload);
    }
    static remove(toRemove) {
        if (this.awaiting.length == 0) { return; }
        this.awaiting.splice(this.awaiting.indexOf(toRemove), 1);
        if (this.awaiting.length == 0) {
            this.alreadyCompleted = true;
            this.callback();
        }
    }
}

function confPage_init() {
    pageConfs = collectedConferences[pageToLoad];
    if (pageToLoad.includes('-full')) {
        pageToLoad = pageToLoad.split('-full')[0];
        DownloadWaiter.add(pageToLoad);
        
        // first grab that conference, then create the page
        fetch('https://21beckem.github.io/conference-data/' + pageToLoad + '-full.json')
            .then(res => res.json())
            .then(res => {
                // flatten sessions and put in same format as whole conf page
                let talksList = [null];
                let idCounter = 0;
                for (let i=0; i < res.sessions.length; i++) {
                    const thisSession = res.sessions[i];
                    sessionName = thisSession.name.split('-');
                    sessionName.pop();
                    sessionName = sessionName.join(' ').toTitleCase();
                    let linkMonth = String(res.date[0]).length == 1 ? '0' + res.date[0] : res.date[0];
                    talksList.push({
                        'id' : res.date.join('-'),
                        'speaker' : 'General Conference',
                        'title' : sessionName,
                        'img' : defaultConfImage,
                        'data' : {
                            'talks' : thisSession.talks,
                            'isSession' : true
                        },
                        'link' : `https://www.churchofjesuschrist.org/study/general-conference/${res.date[1]}/${linkMonth}/${thisSession.name}?lang=eng`
                    });
                    for (let j=0; j < thisSession.talks.length; j++) {
                        const thisTalk = thisSession.talks[j];
                        thisTalk.id = 'talkId_' + idCounter;
                        thisTalk.data = thisTalk.talkText;
                        talksList.push(thisTalk);
                        idCounter++;
                    }
                }
                pageConfs = talksList;
                DownloadWaiter.remove(pageToLoad);
                createPageTiles();
            })
    } else {
        createConferencePage();
    }
}

function createConferencePage() {
    // create the tiles for this page
    createPageTiles();

    
    // start fetching each one of those conference data jsons
    for (let i=1; i < pageConfs.length; i++) {
        const thisConfId = pageConfs[i];
        DownloadWaiter.add(thisConfId);
        fetch('https://21beckem.github.io/conference-data/' + thisConfId + '-full.json')
            .then(res => res.json())
            .then(res => {
                pageConfs[i] = {
                    'id' : pageConfs[i],
                    'data' : res
                }
                DownloadWaiter.remove(thisConfId);
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

function createPageTiles(searchTerm = '') {
    // create loader instead of just clearing the box
    TilesBox.innerHTML = '<div class="loader"></div>';
    let output = '';
    for (let i=1; i < pageConfs.length; i++) {
        let thisConf = pageConfs[i];
        let confId = thisConf;
        let imgLink = defaultConfImage;
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
            let AL = new searchAlgorithm();
            resultsNumber = AL.searchConfrence(searchTerm, thisConf.data);
        }

        // if this is actually just one talk, not a conference
        let onclick = `"window.location.href = 'smart-report.html?page=${confId}-full';"`;
        let isTalk = '';
        if (thisConf.speaker) {
            isTalk = 'isTalk';
            thisDate = thisConf.title;
            imgLink = thisConf.img;
            onclick = `"openExternalLink('${thisConf.link}');"`
        } else {
            thisDate = (thisDate[1].includes('10') ? 'October' : 'April') + ' ' + thisDate[0];
        }

        // create the tile
        output += `
        <div id="tile_${confId}" class="tileBox ${isTalk}" style="background-image: url(${imgLink});" onclick=${onclick}>
            <div class="tileResults" style="opacity:${resultsOpacity};">
                <span>${resultsNumber}</span>
                <span>References</span>
            </div>
            <div class="tileBottom">
                <span>${thisDate}</span>
            </div>
        </div>`;
    }
    
    // if this is the main page, make tiles for other pages
    if (pageToLoad == 'main') {
        for (let i = 0; i < Object.keys(collectedConferences).length; i++) {
            const confPage = Object.keys(collectedConferences)[i];
            if (confPage != pageToLoad) {
                output += `
                <div id="page_${confPage}" class="tileBox" style="background-image: url(${collectedConferences[confPage][0]})" onclick="window.location.href = 'smart-report.html?page=${confPage}';">
                    <div class="tileResults" style="opacity:0;">
                        <span>0</span>
                        <span>References</span>
                    </div>
                    <div class="tileBottom">
                        <span>${confPage}</span>
                    </div>
                </div>`;
            }
        }
    }
    TilesBox.innerHTML = output;
}