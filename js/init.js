/* global sliderControl, scatterplot */

(function() {

    var initialSize = 400;
    var initialDataCount = 5;
    var aspect = 1.2;

    var chart = scatterplot();

    // create vis container
    var vis = d3.select('#vis').append('svg')
        .call(chart);

    function resizeVis(value) {
        vis.attr({
            width: value,
            height: value / aspect
        });
        chart.resize().render();
    }

    resizeVis(initialSize);

    // slider for vis container size

    var sizeControl = sliderControl()
        .domain([100, 1000])
        .on('change', resizeVis);

    d3.select('#size-slider').call(sizeControl);
    sizeControl.value(initialSize);

    // create fake data
    function createData(dataSize) {
        var gen1 = d3.random.normal(70, 15);
        var gen2 = d3.random.normal(50, 8);
        var gen = function(i) {
            return i % 3 ? gen1() : gen2();
        };
        var data = new Array(dataSize);
        var index = -1;

        while (index++ < dataSize) data[index] = { x: gen(index), y: gen(index), name: 'Point ' + index };

        return data;
    }

    var dataSize = 1e6;
    var data = createData(dataSize);
    var currentData;

    function setDataSize(size) {
        currentData = data.slice(0, size);
        chart.data(currentData).render();
    }

    // slider for data

    var dataDomain = [1, dataSize];
    var dataScale = d3.scale.log()
        .domain(dataDomain)
        .nice();
    var dataTicks = dataScale.ticks()
        .filter(function(t) {
            return String(t).indexOf(1) === 0;
        });

    var dataControl = sliderControl()
        .scale(dataScale)
        .domain(dataDomain)
        .tickValues(dataTicks)
        .tickFormat(d3.format('3s'))
        .on('change', setDataSize);

    d3.select('#data-slider').call(dataControl);
    dataControl.value(initialDataCount);

    // PPP indicator

    function updatePPP() {
        var ppp = chart.ppp();
        d3.select('#ppp').text(ppp.toFixed(8));
    }

    chart
        .on('data.ppp', updatePPP)
        .on('resize.ppp', updatePPP);

    updatePPP();

})();
