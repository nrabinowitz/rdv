(function(window) {

    var rdv = {};

    function Feature(opts) {
        _.extend(this, opts);
        _.bindAll(this, 'on', 'off');
    }

    function noop() {}

    var WIDTH = rdv.WIDTH = {};
    var TWOD = rdv.TWOD = {};
    rdv.HEIGHT = {};

    Feature.prototype = {
        range: [0, Infinity],
        vis: null,
        on: noop,
        off: noop,

        applies: function(ppp) {
            var range = this.range;
            return range[0] <= ppp && ppp < range[1];
        },

        apply: function(ppp) {
            var feature = this;
            var applies = feature.applies(ppp);
            return applies ? feature.on : feature.off;
        }
    };

    rdv.Feature = Feature;

    rdv.Vis = function(dimensionality, minPPP) {
        dimensionality = dimensionality || TWOD;
        minPPP = minPPP || 0;

        var selection;
        var data = [];
        var features = [];
        var margin = margin || { top: 0, bottom: 0, right: 0, left: 0 };
        var w;
        var h;
        var dispatch = d3.dispatch('data', 'resize');


        function vis(sel) {
            selection = sel;
        }

        function getPPP() {
            var ew = w - margin.right - margin.left;
            var eh = h - margin.top - margin.bottom;
            var pixels = dimensionality === TWOD ? ew * eh :
                dimensionality === WIDTH ? ew : eh;
            return data.length / pixels;
        }

        vis.ppp = getPPP;

        vis.render = function() {
            var ppp = getPPP();
            features.forEach(function(feature) {
                selection.call(feature.apply(ppp));
            });
            return vis;
        };

        vis.resize = function() {
            var rect = selection.node().getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            dispatch.resize(w, h);
            return vis;
        };

        vis.data = function(d) {
            if (d) {
                data = d;
                dispatch.data(data);
                return vis;
            }
            return data;
        };

        vis.features = function(d) {
            if (d) {
                features = d;
                // add vis ref to features
                features.forEach(function(feature) {
                    feature.vis = vis;
                });
                return vis;
            }
            return features;
        };

        vis.w = function(d) {
            if (d !== undefined) {
                w = d;
                return vis;
            }
            return w;
        };

        vis.h = function(d) {
            if (d !== undefined) {
                h = d;
                return vis;
            }
            return h;
        };

        vis.margin = function(d) {
            if (d !== undefined) {
                margin = d;
                return vis;
            }
            return margin;
        };

        vis.on = function() {
            dispatch.on.apply(dispatch, arguments);
            return vis;
        };

        return vis;
    };

    window.rdv = rdv;

}(this));
