const defaultMnmnImage = 'https://content.churchofjesuschrist.org/language-pages/bc/GLO/Default.png';
function mrmnPage_init(searchTerm = '') {
    if (pageToLoad == 'main') {
        createMainPage(searchTerm);
    }
    else if (pageToLoad.includes('book_')) {
        createBookTiles(searchTerm);
    }
}
function flattenChapters(bok) {
    let output = '';
    for (let i = 0; i < bok.chapters.length; i++) {
        output += bok.chapters[String(i + 1)].join('\n');
    }
    return output;
}

async function createMainPage(searchTerm = '') {
    TilesBox.innerHTML += '<div class="overLoader-dimmer"></div><div class="overLoader"><div class="loader"></div></div>';
    let output = '';
    for (const bok of book_list) {
        let resultsOpacity = 0;
        let founds = 0;
        if (searchTerm != '') {
            // fetch the book
            let res = await fetch(`https://21beckem.github.io/book-of-mormon-data/MB/${bok}.json`);
            let bokData = await res.json();

            // search algorithm
            let AL = new searchAlgorithm();
            founds = AL.searchText(searchTerm, flattenChapters(bokData));
            resultsOpacity = 1;
        }
        output += `
<div id="tile_${bok.replace(' ', '_')}" class="tileBox " style="background-image: url(${defaultMnmnImage});" onclick="window.location.href = 'smart-report.html?pg=mrmn&page=book_${bok}';">
    <div class="tileResults" style="opacity:${resultsOpacity};">
        <span>${founds}</span>
        <span>References</span>
    </div>
    <div class="tileBottom">
        <span>${bok}</span>
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
    console.log(bokData);
    

    // create tiles for each chapter
    for (let i = 0; i < bokData.chapters.length; i++) {
        let chapter = bokData.chapters[String(i+1)];
        output += `
    <div id="tile_${bok.replace(' ', '_')}" class="tileBox " style="background-image: url(${defaultMnmnImage});" onclick="window.location.href = 'smart-report.html?pg=mrmn&page=book_${bok}';">
        <div class="tileResults" style="opacity:0;">
            <span>0</span>
            <span>References</span>
        </div>
        <div class="tileBottom">
            <span>${bok}</span>
        </div>
    </div>`;
    }
    TilesBox.innerHTML = output;

}