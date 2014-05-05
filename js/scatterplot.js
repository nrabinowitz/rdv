/* global rdv */

window.scatterplot = function() {
    var vis;

    // range constants
    var LOW_RANGE = [0, 5e-3];
    var MED_RANGE = [5e-3, 1e-2];
    var HIGH_RANGE = [1e-2, Infinity];
    var MED_HIGH_RANGE = [MED_RANGE[0], HIGH_RANGE[1]];

    // margins
    var margin = { top: 15, bottom: 30, right: 15, left: 30 };
    var wMargin = margin.left + margin.right;
    var hMargin = margin.top + margin.bottom;

    // scales
    var x = d3.scale.linear();
    var y = d3.scale.linear();

    // axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    function container(selection, cls) {
        var sel = this.container = selection.selectAll('g.' + cls)
                .data([0]);

        return sel.enter().append("g")
            .attr('class', cls)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    function containerOff() {
            var container = this.container;
            if (container) {
                container.remove();
            }
            this.container = null;
    }

    var axes = new rdv.Feature({
        on: function(selection) {

            var containerEntry = container.call(this, selection, 'axes');

            containerEntry.append("g")
                .attr("class", "x axis");

            containerEntry.append("g")
                .attr("class", "y axis");

            var minTickSize = 30;
            var xTickCount = Math.min(~~((vis.w() - wMargin) / minTickSize), 10);
            var yTickCount = Math.min(~~((vis.h() - hMargin) / minTickSize), 10);

            xAxis.ticks(xTickCount);
            yAxis.ticks(yTickCount);

            this.container.selectAll(".x.axis")
                .attr("transform", "translate(0," + (vis.h() - hMargin) + ")")
                .call(xAxis);

            this.container.selectAll(".y.axis")
                .call(yAxis);

        }
    });

    var circles = new rdv.Feature({
        range: LOW_RANGE,
        container: null,

        on: function(selection) {
            var data = vis.data();

            container.call(this, selection, 'circles');

            var circles = this.container.selectAll('circle')
                .data(data);

            circles.enter().append('circle');

            circles.exit().remove();

            circles.attr({
                cx: function(d) { return x(d.x); },
                cy: function(d) { return y(d.y); },
                // XXX: responsive radius
                r: 5
            });
        },

        off: containerOff
    });

    var bins = new rdv.Feature({
        range: MED_HIGH_RANGE,
        container: null,

        on: function(selection) {
            var data = vis.data();
            var w = vis.w() - wMargin;
            var h = vis.h() - hMargin;

            // XXX: responsive bin count
            var binCount = 20;
            var xBin = d3.scale.quantize()
                .domain(x.domain())
                .range(d3.range(binCount));
            var yBin = d3.scale.quantize()
                .domain(y.domain())
                .range(d3.range(binCount));

            var binData = new Array(binCount * binCount);
            for (var i = 0; i < binData.length; i++) binData[i] = 0;

            data.forEach(function(d) {
                var index = xBin(d.x) + (binCount * yBin(d.y));
                binData[index]++;
            });

            var color = d3.scale.linear()
                .domain([0, d3.max(binData)])
                .range([0, 1]);

            container.call(this, selection, 'bins');

            var bins = this.container.selectAll('rect')
                .data(binData);

            bins.enter().append('rect')
                .style('fill', 'steelblue');

            bins.exit().remove();

            var rw = w / binCount;
            var rh = h / binCount;
            bins.attr({
                transform: function(d, i) {
                    return 'translate(' + ((i % binCount) * rw) + ',' + (h - rh - ~~(i / binCount) * rh) + ')';
                },
                width: rw,
                height: rh,
                opacity: color
            });
        },

        off: containerOff
    });


    var features = [
        axes,
        circles,
        bins
    ];

    vis = rdv.Vis(features, margin, rdv.TWOD);

    vis.on('data', function(data) {
        x.domain(d3.extent(data, function(d) { return d.x; })).nice();
        y.domain(d3.extent(data, function(d) { return d.y; })).nice();
    });

    vis.on('resize', function(w, h) {
        x.range([0, w - wMargin]);
        y.range([h - hMargin, 0]);
    });

    return vis;

};
