document.addEventListener('DOMContentLoaded', function() {
    const dial_selects = document.querySelectorAll('.dial-select');
    dial_selects.forEach(dial_select => {
        dial_select.addEventListener('click', function() {
            // open the dial for this guy
        });
    });
    document.body.innerHTML += ``;


    const dial = document.querySelector('.dial');
    const items = dial.querySelectorAll('div');

    dial.addEventListener('scroll', debounce(highlightSelectedItem, 100));

    function highlightSelectedItem() {
        let closestItem = null;
        let closestDistance = Infinity;

        items.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const dialRect = dial.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - (dialRect.top + dialRect.height / 2));
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });

        items.forEach(item => item.classList.remove('selected'));
        if (closestItem) {
            closestItem.classList.add('selected');
        }
    }

    // Debounce function to limit the rate of function execution
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize the dial to show the first item as selected
    highlightSelectedItem();
});
