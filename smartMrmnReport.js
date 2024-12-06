const defaultMnmnImage = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
function mrmnPage_init(searchTerm = '') {
    TilesBox.innerHTML += '<div class="overLoader-dimmer"></div><div class="overLoader"><div class="loader"></div></div>';
    let pageToLoadData = [];
    if (pageToLoad == 'main') {
        for (const bok of BookOfMormon.books_list) {
            let founds = 0;
            let resultsOpacity = 0;
            if (searchTerm != '') {
                let AL = new searchAlgorithm();
                founds = AL.searchText(searchTerm, flattenChapters(BookOfMormon.books[bok]));
                resultsOpacity = 1;
            }
            pageToLoadData.push({
                'title': bok,
                'founds': 0,
                'resultsOpacity': resultsOpacity,
                'onclick': `window.location.href = 'smart-report.html?pg=mrmn&page=book_${bok}';`
            });
        }
    }
    else if (pageToLoad.includes('book_')) {
        let thisBok = pageToLoad.split('book_')[1];
        console.log(BookOfMormon.books[thisBok]);
        
        for (let i = 0; i < BookOfMormon.books[thisBok].chapters; i++) {
            let chapNum = String(i + 1);
            let chapter = BookOfMormon.books[thisBok][chapNum];
            let founds = 0;
            let resultsOpacity = 0;
            if (searchTerm != '') {
                let AL = new searchAlgorithm();
                founds = AL.searchText(searchTerm, chapter,join('\n'));
                resultsOpacity = 1;
            }
            pageToLoadData.push({
                'title': thisBok + ' ' + chapNum,
                'founds': 0,
                'resultsOpacity': resultsOpacity,
                'onclick': `alert('opening in GL');`
            });
        }
    }
    createPageTilesFromData(pageToLoadData);
}
function flattenChapters(bok) {
    let output = '';
    for (let i = 0; i < bok.chapters.length; i++) {
        output += bok.chapters[String(i + 1)].join('\n');
    }
    return output;
}

async function createPageTilesFromData(tilesArr) {
    let output = '';
    for (const tile of tilesArr) {
        output += `
<div id="tile_${tile.title.replace(' ', '_')}" class="tileBox " style="background-image: url(${defaultMnmnImage});" onclick="${tile.onclick}">
    <div class="tileResults" style="opacity:${tile.resultsOpacity};">
        <span>${tile.founds}</span>
        <span>References</span>
    </div>
    <div class="tileBottom">
        <span>${tile.title}</span>
    </div>
</div>`;
    }
    TilesBox.innerHTML = output;
}

async function createBookTiles(searchTerm = '') {
    TilesBox.innerHTML = '<div class="overloaderDimmer"></div><div class="overLoader"><div class="loader"></div></div>';
    let bok = pageToLoad.split('book_')[1];
    let output = '';
    // await fetch the book
    let res = await fetch(`https://21beckem.github.io/book-of-mormon-data/MB/${bok}.json`);
    let bokData = await res.json();
    console.log(JSON.parse(JSON.stringify(bokData)));
    

    // create tiles for each chapter
    for (let i = 0; i < bokData.chapters; i++) {
        chapNum = String(i+1);
        let chapter = bokData[chapNum];

        // // if searching, do the search       // for searching each chapter, directly copied from smartConfReport.js
        // if (searchTerm != '') {
        //     resultsOpacity = 1;
        //     let AL = new searchAlgorithm();
        //     resultsNumber = AL.searchConfrence(searchTerm, thisConf.data);
        // }

        output += `
    <div id="tile_${bok.replace(' ', '_')}" class="tileBox " style="background-image: url(${defaultMnmnImage});" onclick="window.location.href = 'smart-report.html?pg=mrmn&page=book_${bok}';">
        <div class="tileResults" style="opacity:0;">
            <span>0</span>
            <span>References</span>
        </div>
        <div class="tileBottom">
            <span>${bok + ' ' + chapNum}</span>
        </div>
    </div>`;
    }
    TilesBox.innerHTML = output;

}