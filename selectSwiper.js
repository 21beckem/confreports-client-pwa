document.body.innerHTML += `
<div class="dialPopupBox hidden">
    <div class="dialPopupBackgroundDimmer" onclick="this.parentElement.classList.add('hidden')"></div>
    <div class="dial-container">
        <div class="dial"></div>
    </div>
</div>`;
// get styles from script element
const style = {
    backgroundColor: document.currentScript.getAttribute('background-color') || 'white',
    defaultColor: document.currentScript.getAttribute('default-color') || 'black',
    selectedColor: document.currentScript.getAttribute('selected-color') || 'white',
    selectedHighlight: document.currentScript.getAttribute('selected-highlight') || '#007bff'
}
const dial_selects = document.querySelectorAll('.dial-select');
const dial = document.querySelector('.dial');
const dialPopupBox = document.querySelector('.dialPopupBox');
let current_dial_input = null;
dial_selects.forEach(dial_select => {
    dial_select.addEventListener('click', () => {
        dial_select.blur();
        // fill in dial
        dial.innerHTML = '';
        const options = dial_select.getAttribute('data-options').split(',');
        dial.innerHTML += '<div></div><div></div>';
        options.forEach(option => {
            let selected = String(option).trim()==String(dial_select.value).trim() ? 'class="selected"' : '';
            dial.innerHTML += `<div onclick="makeMeSelected(this)" ${selected}>${option}</div>`;
        });
        dial.innerHTML += '<div></div><div></div>';

        // show dial popup
        current_dial_input = dial_select;
        dialPopupBox.classList.remove('hidden');

        // Scroll to the pre-selected item and highlight it
        const selectedItem = document.querySelector('.dial div.selected');
        if (selectedItem) {
            const selectedItemTop = selectedItem.offsetTop;
            const containerHeight = dial.clientHeight;
            const itemHeight = selectedItem.clientHeight;
            const scrollTo = selectedItemTop - (containerHeight / 2) + (itemHeight / 2);
            dial.scrollTo(0, scrollTo);
        }
        highlightSelectedItem();
    });
});
function makeMeSelected(me) {
    if (!current_dial_input) { return; }
    // remove current selected item
    document.querySelector('.dial div.selected').classList.remove('selected');
    me.classList.add('selected');
    const selectedItemTop = me.offsetTop;
    const containerHeight = dial.clientHeight;
    const itemHeight = me.clientHeight;
    const scrollTo = selectedItemTop - (containerHeight / 2) + (itemHeight / 2);
    dial.scrollTo({
        top: scrollTo,
        left: 0,
        behavior: "smooth",
    });
    highlightSelectedItem(me);
}
dial.addEventListener('scroll', () => {
    highlightSelectedItemDebounced();
    adjustFontSize();
});
const highlightSelectedItemDebounced = debounce(highlightSelectedItem, 100);

function adjustFontSize() {
    const dialRect = dial.getBoundingClientRect();
    const dialCenter = dialRect.top + dialRect.height / 2;

    dial.querySelectorAll('div').forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - dialCenter);

        // Adjust the font size based on the distance from the center
        const maxFontSize = 40; // Maximum font size
        const minFontSize = 10; // Minimum font size
        const maxDistance = dialRect.height / 2;

        let fontSize = maxFontSize - (distance / maxDistance) * (maxFontSize - minFontSize);
        fontSize = Math.max(minFontSize, fontSize); // Ensure the font size does not go below the minimum

        item.style.fontSize = `${fontSize}px`;
    });
}

function highlightSelectedItem(closestItem = null) {
    if (!closestItem) {
        let closestDistance = Infinity;
        dial.querySelectorAll('div').forEach((item) => {
            const rect = item.getBoundingClientRect();
            const dialRect = dial.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - (dialRect.top + dialRect.height / 2));
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });
    }
    dial.querySelectorAll('div').forEach(item => {
        item.classList.remove('selected');
        item.style.color = style.defaultColor;
        item.style.backgroundColor = style.backgroundColor;
    });
    if (closestItem) {
        closestItem.classList.add('selected');
        closestItem.style.color = style.selectedColor;
        closestItem.style.backgroundColor = style.selectedHighlight;
        current_dial_input.value = closestItem.innerHTML.trim();
    }
    adjustFontSize();
}

// Debounce function to limit the rate of function execution
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
