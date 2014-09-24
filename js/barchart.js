/* global rdv */

window.barchart = function() {
    var VERY_LOW_RANGE = [0, 0.08];
    var LOW_RANGE = [0, 0.7];
    var VERY_LOW_TO_HIGH = [0.08, Infinity];
    var HIGH_RANGE = [0.7, Infinity];
    var MIN_PPP = 0;

    // margins
    var margin = { top: 30, bottom: 15, right: 15, left: 80 };
    var wMargin = margin.left + margin.right;
    var hMargin = margin.top + margin.bottom;

    // vis
    var vis = rdv.Vis(rdv.HEIGHT, MIN_PPP)
        .margin(margin);

    // scales
    var x = d3.scale.linear();
    var y = d3.scale.ordinal();

    // axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    function projectValue(d) {
        return x(d.x);
    }

    function projectName(d) {
        return y(d.name);
    }

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

    vis.xaxis = new rdv.Feature({
        name: "X Axis",
        on: function(selection) {
            var containerEntry = container.call(this, selection, 'x-axis');

            containerEntry.append("g")
                .attr("class", "x axis");

            this.container.selectAll(".x.axis")
                .call(xAxis);
        }
    });

    vis.yaxis = new rdv.Feature({
        name: "Y Axis",
        range: VERY_LOW_RANGE,
        container: null,

        on: function(selection) {
            var vis = this.vis;

            var containerEntry = container.call(this, selection, 'y-axis');

            containerEntry.append("g")
                .attr("class", "y axis");

            this.container.selectAll(".y.axis")
                .call(yAxis);
        },

        off: containerOff
    });

    vis.mouseLabels = new rdv.Feature({
        name: "Mouseover Labels",
        range: VERY_LOW_TO_HIGH,
        container: null,

        on: function(selection) {
            var vis = this.vis;
            var data = vis.data();

            var containerEntry = container.call(this, selection, 'mouse-labels');

            var label = containerEntry.append("text")
                .attr({
                    'text-anchor': 'end',
                    'dy': '1em',
                    'dx': -3
                });

            function update(index) {
                var over = data[index];
                var toBind = over ? [over] : [];

                label.data(toBind);

                label
                    .text(function(d) { return d.name; })
                    .attr('y', projectName);
            }

            update(data.length - 1);
        },

        off: containerOff
    });

    vis.bars = new rdv.Feature({
        name: "Bars",
        range: LOW_RANGE,
        container: null,

        on: function(selection) {
            var vis = this.vis;
            var data = vis.data();

            container.call(this, selection, 'bars');

            var bars = this.container.selectAll('rect')
                .data(data);

            bars.enter().append('rect');

            bars.exit().remove();

            bars.attr({
                width: projectValue,
                height: y.rangeBand(),
                y: projectName
            });
        },

        off: containerOff
    });

    var edge = d3.svg.line()
        .x(projectValue)
        .y(projectName);

    vis.poly = new rdv.Feature({
        name: "Polygon",
        range: HIGH_RANGE,
        container: null,

        on: function(selection) {
            var vis = this.vis;
            var data = vis.data();

            // Use the PPP ratio as the step to sample the data
            var step = Math.round(vis.ppp());
            var sample = [];
            var index = data.length - 1;

            while (index >= 0) {
                sample.unshift(data[index]);
                index -= step;
            }

            container.call(this, selection, 'poly');

            var poly = this.container.selectAll('path')
                .data([sample]);

            poly.enter().append('path');

            poly.exit().remove();

            poly.attr({
                d: function(d) {
                    return 'M0,' + projectName(d[0]) + 'L' + edge(d).substring(1) + 'L0,0Z';
                }
            });
        },

        off: containerOff
    });

    // Add features to vis
    vis.features([
        vis.yaxis,
        vis.mouseLabels,
        vis.xaxis,
        vis.bars,
        vis.poly
    ]);

    vis.on('data', function(data) {
        data.sort(function(a, b) { return a.x - b.x; });

        x.domain([0, _.last(data).x]).nice();
        y.domain(_.pluck(data, 'name'));
    });

    vis.on('resize', function(w, h) {
        x.range([0, w - wMargin]);
        y.rangeBands([h - hMargin, 0], 0.1);
    });


    return vis;

};
