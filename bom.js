class BookOfMormon {
	static books_list = [
		"1 Nephi",
		"2 Nephi",
		"Jacob",
		"Enos",
		"Jarom",
		"Omni",
		"Words of Mormon",
		"Mosiah",
		"Alma",
		"Helaman",
		"3 Nephi",
		"4 Nephi",
		"Mormon",
		"Ether",
		"Moroni"
	];
	static books = {};
    static init() {
		let toLoad = [];
        for (const bok of BookOfMormon.books_list) {
			if (localStorage.getItem(bok) != null) {  // if that book is in local storage, load it. otherwise, fetch it.
				BookOfMormon.books[bok] = JSON.parse(localStorage.getItem(bok));
			} else {
				toLoad.push(bok);
				fetch(`https://21beckem.github.io/book-of-mormon-data/MB/${bok}.json`)
					.then(res => res.json())
					.then(res => {
						window[bok] = res;
						localStorage.setItem(bok, JSON.stringify(res));
						toLoad.splice(toLoad.indexOf(bok), 1);
						if (toLoad.length == 0) { console.log('BoM loaded'); }
					});
			}
		}
		if (toLoad.length == 0) { console.log('BoM loaded'); }
    }
}
BookOfMormon.init();