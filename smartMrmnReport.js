const defaultMnmnImage = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
function mrmnPage_init(searchTerm = '') {
    TilesBox.innerHTML += '<div class="overLoader-dimmer"></div><div class="overLoader"><div class="loader"></div></div>';
    let pageToLoadData = [];
    if (pageToLoad == 'main') {
        setPageSubtitle('Book of Mormon');
        for (const bok of BookOfMormon.books_list) {
            let founds = 0;
            let resultsOpacity = 0;
            if (searchTerm != '') {
                let AL = new searchAlgorithm();
                founds = AL.searchTextRaw(searchTerm, flattenChapters(BookOfMormon.books[bok]));
                resultsOpacity = 1;
            }
            pageToLoadData.push({
                'title': bok,
                'founds': founds,
                'resultsOpacity': resultsOpacity,
                'onclick': `window.location.href = 'smart-report.html?pg=mrmn&page=book_${bok}';`
            });
        }
    }
    else if (pageToLoad.includes('book_')) {
        let thisBok = pageToLoad.split('book_')[1];
        console.log(BookOfMormon.books[thisBok]);
        setPageSubtitle('Book of Mormon | ' + thisBok);
        
        for (let i = 0; i < BookOfMormon.books[thisBok].chapters; i++) {
            let chapNum = String(i + 1);
            let chapter = BookOfMormon.books[thisBok][chapNum];
            let founds = 0;
            let resultsOpacity = 0;
            if (searchTerm != '') {
                let AL = new searchAlgorithm();
                founds = AL.searchTextRaw(searchTerm, chapter.join('\n'));
                
                resultsOpacity = 1;
            }
            pageToLoadData.push({
                'title': thisBok + ' ' + chapNum,
                'founds': founds,
                'resultsOpacity': resultsOpacity,
                'onclick': `analyzeOrOpen('https://www.churchofjesuschrist.org/study/scriptures/bofm/${BookOfMormon.books[thisBok]['link-id']}/${chapNum}?lang=eng');`
            });
        }
    }
    createPageTilesFromData(pageToLoadData);
    setTimeout(() => { DownloadWaiter.callback(); }, 200);
}
function flattenChapters(bok) {
    let output = '';
    for (let i = 0; i < bok.chapters; i++) {
        output += bok[String(i + 1)].join('\n');
    }
    return output;
}
function setPageSubtitle(str) {
    try {
        window.parent.setSubTitle(str);
    } catch (e) {}
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