class searchAlgorithm { 
    constructor() {
        this.reset();
    }
    reset() {
        this.exceptions = [];
        this.founds = {};
        this.total = 0;
    }
    addException(exception) {
        this.exceptions.push(exception);
    }
    removeException(exception) {
        this.exceptions = this.exceptions.filter(e => e != exception);
    }

    filterFounds(theseFounds) {
        let totalAllowedFound = 0;
        theseFounds.forEach(found => {
            if (this.exceptions.includes(found)) {
                return;
            }
            this.founds[found] = this.founds[found] ? this.founds[found] + 1 : 1;
            totalAllowedFound++;
        });
        return totalAllowedFound;
    };
    static createRegexForSearch(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase(); // trim and convert to lower case
        searchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // excape chars that will confuse regex
        searchTerm = searchTerm.replace('\\*', '\\w*'); // add the wildcard from the *
        searchTerm = "\\b" + searchTerm + "\\b"; // add boundaries at beginning and end
        return new RegExp(searchTerm, "g"); // create the regex
    }

    searchConfrence(searchTerm, confData) {
        let runningTotal = 0;
        let regex = searchAlgorithm.createRegexForSearch(searchTerm);
        if (!confData.sessions) {
            if (confData.isSession) {
                // if given just 1 session, turn it into a conference with just 1 session
                confData = { 'sessions' : [confData] }
            } else {
                // if given 1 talk text, not a conference
                return this.searchText(regex, confData);
            }
        }
        for (let i = 0; i < confData.sessions.length; i++) {
            const thisSession = confData.sessions[i];
            for (let j = 0; j < thisSession.talks.length; j++) {
                const thisTalk = thisSession.talks[j];
                runningTotal += this.searchText(regex, thisTalk.talkText);
            }
        }
        this.total += runningTotal;
        return runningTotal;
    }

    searchText(regex, textBody) {
        let theseFounds = ( textBody.toLowerCase().match(regex) || [] );
        return this.filterFounds(theseFounds);
    }
}