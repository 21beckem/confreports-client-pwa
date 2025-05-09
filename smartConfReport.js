let pageConfs;
const defaultConfImage = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
const MaxIMGsize = 600;
String.prototype.toTitleCase = function() {
    return this.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

function confPage_init() {
    // set download watiter callback to refresh th page once everything loaded
    DownloadWaiter.setCallback(() => { createPageTiles(); });

    pageConfs = collectedConferences[pageToLoad];
    if (pageToLoad.includes('-full')) { // if this is an individual conference, not a list of conferences
        pageToLoad = pageToLoad.split('-full')[0];
        DownloadWaiter.add(pageToLoad);
        let thisDate = pageToLoad.split('-');
        thisDate = (thisDate[1].includes('10') ? 'Oct' : 'Apr') + ' ' + thisDate[0];
        setPageSubtitle('Conference | ' + thisDate);
        
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
                        thisTalk.img = thisTalk.img.includes('/0/default') ?
                            thisTalk.img.replace(/\/full\/.*\/0\/default/g, '/full/!' + MaxIMGsize + '%2C/0/default')
                                :
                            'https://www.churchofjesuschrist.org/imgs/' + thisTalk.img.split('/').splice(-2,1)[0] + '/full/!' + MaxIMGsize + '%2C/0/default';;
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
                    'data' : res,
                }
                DownloadWaiter.remove(thisConfId);
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
        setPageSubtitle('Conference');
    }
    else {
        setPageSubtitle('Conference | ' + pageToLoad);
    }
}
function setPageSubtitle(str) {
    try {
        window.parent.setSubTitle(str);
    } catch (e) {}
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
        let onclick = `"window.location.href = 'smart-report.html?pg=conf&page=${confId}-full';"`;
        let isTalk = '';
        if (thisConf.speaker) {
            isTalk = 'isTalk';
            thisDate = thisConf.title;
            imgLink = thisConf.img;
            
            onclick = `"analyzeOrOpen('${thisConf.link}', '${pageToLoad}', ${i});"`;
        } else {
            thisDate = (thisDate[1].includes('10') ? 'Oct' : 'Apr') + ' ' + thisDate[0];
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
                <div id="page_${confPage}" class="tileBox" style="background-image: url(${collectedConferences[confPage][0]})" onclick="window.location.href = 'smart-report.html?pg=conf&page=${confPage}';">
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