class searchAlgorithm { 
    constructor() {
        this.reset();
    }
    reset() {
        this.founds = {};
        this.total = 0;
    }

    addFoundResult(theseFounds) {
        theseFounds.forEach(found => {
            this.founds[found] = this.founds[found] ? this.founds[found] + 1 : 1;
        });
    };

    searchConfrence(searchTerm, confData) {
    
        let runningTotal = 0;
        searchTerm = searchTerm.trim().toLowerCase(); // trim and convert to lower case
        searchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // excape chars that will confuse regex
        searchTerm = searchTerm.replace('\\*', '\\w*'); // add the wildcard from the *
        searchTerm = "\\b" + searchTerm + "\\b"; // add boundaries at beginning and end
        let regex = new RegExp(searchTerm, "g"); // create the regex
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
        this.addFoundResult(theseFounds);
        return theseFounds.length;
    }
}