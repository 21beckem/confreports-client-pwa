class MobileGrapher {
    constructor(graphParentElId, data) {
        this.graphParentEl = document.getElementById(graphParentElId);
        this.data = data;

        if (!this.data.hasOwnProperty('bars') || !this.data.hasOwnProperty('vals')) {
            console.error('MobileGrapher data must have bars and vals properties');
            return;
        } else if (this.data.bars.length != this.data.vals.length) {
            console.error('MobileGrapher bars and vals arrays must be the same length');
            return;
        }

        this.createGraphBody();
        this.graph();
    }

    graph() {
        // get infos and make things to paste
        let maxValue = Math.max(...this.data.vals);
        const {intervalSize, numberOfIntervals} = MobileGrapher.calculateIntervals(maxValue);
        let graphSquares = Array.from({length: numberOfIntervals}, (_, i) => '<div class="graphSquare"></div>').join('');

        let contentWidth = this.graphParentEl.clientWidth - 105;

        // make topHeaderRow
        let topHeaderRow = Array.from({length: numberOfIntervals}, (_, i) => `<div class="graphSquareNum">${(i + 1) * intervalSize}</div>`).join('');
        this.graphParentEl.querySelector('.topHeaderRow.graphRow').innerHTML = `<div class="leftTitle totalBox" style="background-color: var(--dark-tone); color: var(--light-tone);margin-top:-8px;"></div>` + topHeaderRow;

        // make the graph
        let toOutput = '';
        for (let i = 0; i < this.data.bars.length; i++) {
            const thisBar = this.data.bars[i];
            const thisVal = this.data.vals[i];
            const computedSize = (thisVal / (intervalSize * numberOfIntervals)) * contentWidth;
            toOutput += `
                    <div class="graphRow">
                        <div class="leftTitle">${thisBar}</div>
                        <div class="bar" style="width: ${computedSize}px">${thisVal}&nbsp;</div>
                        ${graphSquares}
                    </div>`;
        }
        this.graphParentEl.querySelector('.graphTable').innerHTML = toOutput;
        this.graphParentEl.querySelector('.totalBox').innerHTML = 'Total:<br>' + this.data.vals.reduce((partialSum, a) => partialSum + a, 0);
    }

    createGraphBody() {
        this.graphParentEl.classList.add('mobileGrapher');
        this.graphParentEl.innerHTML = `
            <div class="topHeaderRow graphRow"></div>
            <div class="graphTableWindow">
                <div class="graphTable"></div>
            </div>
        `;
    }
    static calculateIntervals(maxValue, targetIntervals = 5) {
        const niceNumbers = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
        
        let intervalSize = maxValue / targetIntervals;
        
        // Find the nearest nice number
        let niceInterval = niceNumbers.find(num => num >= intervalSize) || niceNumbers[niceNumbers.length - 1];
      
        let numberOfIntervals = Math.ceil(maxValue / niceInterval);
        
        return {
          intervalSize: niceInterval,
          numberOfIntervals: numberOfIntervals
        };
    }
    static setLoader(graphParentEl) {
        document.getElementById(graphParentEl).classList.add('mobileGrapher');
        document.getElementById(graphParentEl).innerHTML = `<div class="loaderBox"><span class="loader"></span></div>`;
    }
}