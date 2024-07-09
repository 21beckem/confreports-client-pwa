function searchConfrence(searchTerm, confData) {
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
            return (confData.toLowerCase().match(regex) || []).length;
        }
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