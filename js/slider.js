
function sliderControl() {

    var w = 400;
    var scale = d3.scale.linear();
    var domain = [0, 1];
    var knobRadius = 5;
    var brush = d3.svg.brush();
    var margin = { top: 15, right: 15, bottom: 20, left: 15 };
    var axis = d3.svg.axis()
        .orient("bottom")
        .tickSize(5);
    var handle;
    var changeHandler;
    var value;
    var dispatch = d3.dispatch('change');

    function updateBrush() {
        value = brush.extent()[0];

        if (d3.event && d3.event.sourceEvent) {
            value = scale.invert(d3.mouse(this)[0] - margin.left);
            brush.extent([value, value]);
        }

        handle.attr("cx", scale(value));
        dispatch.change(value);
    }

    brush.on("brush", updateBrush);

    function control(selection) {

        // update scale
        scale
            .range([0, w])
            .domain(domain)
            .clamp(true);

        // update components
        axis.scale(scale);
        brush.x(scale);

        // container

        var svg = selection.selectAll('svg')
            .data([0]);

        var containerEntry = svg.enter().append('svg');

        svg.attr({
            width: w + margin.right + margin.left,
            height: margin.top + margin.bottom
        });

        // axis
        containerEntry.append("g")
            .attr("class", "slider axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(axis);

        // slider
        var slider = containerEntry.append("g")
            .attr("class", "slider")
            .call(brush);

        slider.selectAll(".extent,.resize")
            .remove();

        // handle
        handle = slider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("r", knobRadius);

        updateBrush();
    }

    control.value = function(d) {
        if (d !== undefined) {
            if (brush.x()) {
                brush.extent([d, d]);
                updateBrush();
            }
            return control;
        }
        return value;
    };

    control.width = function(d) {
        if (d !== undefined) {
            w = d;
            return control;
        }
        return w;
    };

    control.domain = function(d) {
        if (d !== undefined) {
            domain = d;
            return control;
        }
        return domain;
    };

    control.scale = function(d) {
        if (d !== undefined) {
            scale = d;
            return control;
        }
        return scale;
    };

    control.on = function() {
        dispatch.on.apply(dispatch, arguments);
        return control;
    };

    // proxy axis settings
    ['ticks', 'tickFormat', 'tickValues'].forEach(function(method) {

        control[method] = function(d) {
            if (d !== undefined) {
                axis[method](d);
                return control;
            }
            return axis.tickFormat();
        };

    });

    return control;

}
