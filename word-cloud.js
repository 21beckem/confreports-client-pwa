// add cdn scripts to document head
function addCDNScript(link) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = link;
    document.head.appendChild(script);
}
addCDNScript('https://d3js.org/d3.v4.js')
addCDNScript('https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/LIB/d3.layout.cloud.js');

// add loader css
var style = document.createElement('style');
style.innerHTML = `
.WordCloudObject .loaderBox {
    position: absolute;
    top: calc(50% - 30px);
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
}
.WordCloudObject .loader {
    transform: rotateZ(45deg);
    perspective: 1000px;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    color: var(--light-tone);
}

.WordCloudObject .loader:before,
.WordCloudObject .loader:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    transform: rotateX(70deg);
    animation: 1s WordCloudObject-spin linear infinite;
}

.WordCloudObject .loader:after {
    color: var(--dark-tone);
    transform: rotateY(70deg);
    animation-delay: .4s;
}

@keyframes WordCloudObject-spin {
    0%,
    100% {
        box-shadow: .2em 0px 0 0px currentcolor;
    }
    12% {
        box-shadow: .2em .2em 0 0 currentcolor;
    }
    25% {
        box-shadow: 0 .2em 0 0px currentcolor;
    }
    37% {
        box-shadow: -.2em .2em 0 0 currentcolor;
    }
    50% {
        box-shadow: -.2em 0 0 0 currentcolor;
    }
    62% {
        box-shadow: -.2em -.2em 0 0 currentcolor;
    }
    75% {
        box-shadow: 0px -.2em 0 0 currentcolor;
    }
    87% {
        box-shadow: .2em -.2em 0 0 currentcolor;
    }
}
`;
document.head.appendChild(style);

function randomColorBetween(rgb1, rgb2) {
    const [r1, g1, b1] = rgb1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = rgb2.match(/\d+/g).map(Number);

    const r = Math.floor(Math.random() * (r2 - r1 + 1) + r1);
    const g = Math.floor(Math.random() * (g2 - g1 + 1) + g1);
    const b = Math.floor(Math.random() * (b2 - b1 + 1) + b1);

    return `rgb(${r}, ${g}, ${b})`;
}


class WordCloud {
    constructor(svgId, wordsCountsArray, size = [500, 500]) {
        // create the svg parent
        this.svgPar = document.createElement('DIV');
        this.svgPar.id = svgId+'_parent';
        this.svgPar.className = 'WordCloudObject';
        this.svgPar.style.width = size[0] + 'px';
        this.svgPar.style.height = size[1] + 'px';
        document.getElementById(svgId).parentElement.appendChild(this.svgPar);
        this.svgPar.appendChild(document.getElementById(svgId));

        // create the svg
        this.scaler = 10;
        this.svgId = svgId;
        this.render(wordsCountsArray, size);
    }
    async render(wordsCountsArray, size) {
        let loader = JSAlert.loader('loading...');
        await new Promise(r => setTimeout(r, 500));

        this.layout = d3.layout.cloud()
            .size([size[0]*this.scaler, size[1]*this.scaler])
            .words(wordsCountsArray.map((d) => {
                return {text: d[0], size: Math.log(d[1])*20*this.scaler};
            }))
            .padding(5)
            .rotate(function() { return (Math.random()*40)-20; })
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", this.draw.bind(this));
        this.layout.start();

        await new Promise(r => setTimeout(r, 1));
        loader.dismiss()
    }
    draw(words) {
        d3.select("#" + this.svgId)
            .attr("width", this.layout.size()[0])
            .attr("height", this.layout.size()[1])
          .append("g")
            .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(w) { return randomColorBetween("rgb(0,97,133)", "rgb(177,219,232)"); } )
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ") rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
        document.getElementById(this.svgId).style.cssText = `transform: scale(${1/this.scaler}); transform-origin: top left;`;
      }
}