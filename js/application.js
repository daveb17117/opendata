var geojson,
    tileServer = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    tileAttribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    copyLeft = ' | <span class="copyleft">&copy;</span> <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPL v3.0</a> license',
    rmax = 30, //Maximum radius for cluster pies
    markerclusters = L.markerClusterGroup({
        maxClusterRadius: 2 * rmax,
        iconCreateFunction: defineClusterIcon //this is where the magic happens
    }),
    map = L.map('map').setView([46.6, 8.1], 8),
    markers, json, years = [], months = [], maxMin, yyyy = 'all', mm = 'all', timejson;

//Add basemap
L.tileLayer(tileServer, {attribution: tileAttribution + copyLeft, maxZoom: 15}).addTo(map);
//and the empty markercluster layer
map.addLayer(markerclusters);

// Gets all Trainstations
$.getJSON('data/data.json', function (geojson) {
    json = geojson;
    setParams();
    markers = L.geoJson(geojson, {
        pointToLayer: defineFeature,
        onEachFeature: defineFeaturePopup,
        filter: filterMarkers
    });
    markerclusters.addLayer(markers);
    map.fitBounds(markers.getBounds());
});

// Get Years and Months
$.getJSON('data/time.json', function (data) {
    $.each(data, function (key, value) {
        $('#year').append(
            '<label class="radio">'
            + '<input type="radio" name="year" id="radio' + key + '" value="' + key + '" onclick="redraw()"> ' +
            +key + '</label>'
        );
        months = months.concat(value);
        years.push(key);
    });

    months.sort();
    months.forEach(function (month) {
        $('#month').append(
            '<label class="radio">' +
            '<input type="radio" name="month" id="radio' + month + '" value="' + month + '" onclick="redraw()"> ' +
            month + '</label>'
        );
    });

    timejson = data;
});

/* So you only got to get them once they change */
function setParams() {
    // Get Minutes
    maxMin = 2;
    if (document.getElementById('radio1min').checked)
        maxMin = 1;
    else if (document.getElementById('radio2min').checked)
        maxMin = 2;
    else if (document.getElementById('radio3min').checked)
        maxMin = 3;
    else if (document.getElementById('radio4min').checked)
        maxMin = 4;

    // Get Selected Year
    years.forEach(function (year) {
        if ($('#radio' + year).is(':checked')) {
            yyyy = year;
        }
    });
    if ($('#radioyearall').is(':checked')) yyyy = 'all';


    // Get Selected Month
    months.forEach(function (month) {
        if ($('#radio' + month).is(':checked')) {
            mm = month;
        }
    });
    if ($('#radiomonthall').is(':checked')) mm = 'all';
}

function defineFeature(feature, latlng) {
    var strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (1 < 10 ? 12 : 1 < 100 ? 8 : 1 < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

    var restcount,
        restper,
        latecount,
        lateper,
        outcount,
        outper;

    if (yyyy === 'all' && mm === 'all') {
        count = feature["count"]['all'];
        latecount = feature["latecount" + maxMin]['all'];
        outcount = feature.outcount.all;
    } else if (mm === 'all') {
        count = 0;
        if (yyyy in feature['count']) {
            $.each(feature['count'][yyyy], function (key, value) {
                count += value;
            });
        }
        latecount = 0;
        if (yyyy in feature['latecount' + maxMin]) {
            $.each(feature['latecount' + maxMin][yyyy], function (key, value) {
                latecount += value
            });
        }
        outcount = 0;
        if (yyyy in feature['outcount']) {
            $.each(feature['outcount'][yyyy], function (key, value) {
                outcount += value;
            });
        }
    }
    else if (yyyy === 'all') {
        count = 0;
        $.each(feature['count'], function (key, value) {
            if (key !== 'all' && mm in value) count += value[mm];
        });
        latecount = 0;
        $.each(feature['latecount' + maxMin], function (key, value) {
            if (key !== 'all' && mm in value) latecount += value[mm];
        });
        outcount = 0;
        $.each(feature['outcount'], function (key, value) {
            if (key !== 'all' && mm in value) outcount += value[mm];
        });
    } else {
        count = 0;
        if (yyyy in feature["count"] && mm in feature["count"][yyyy]) {
            count += feature["count"][yyyy][mm];
        }

        latecount = 0;
        if (yyyy in feature["late" + maxMin] && mm in feature["late" + maxMin][yyyy]) {
            latecount += feature["late" + maxMin][yyyy][mm];
        }

        outcount = 0;
        if (yyyy in feature['outcount'] && mm in feature['outcount'][yyyy]) {
            outcount += feature['outcount'][yyyy][mm]
        }
    }

    restcount = count - latecount - outcount;
    restper = (100 * (restcount / count)).toFixed(2);
    lateper = (100 * (latecount / count)).toFixed(2);
    outper = (100 * (outcount / count)).toFixed(2);

    var data = [{key: "rest", values: {count: restcount, cat: 4, percentage: restper}},
            {key: "late", values: {count: latecount, cat: 2, percentage: lateper}},
            {key: "out", values: {count: outcount, cat: 1, percentage: outper}}],
        html = bakeThePie({
            data: data,
            valueFunc: function (d) {
                return d.values.count;
            },
            strokeWidth: 1,
            outerRadius: r,
            innerRadius: r - 8,
            pieClass: 'cluster-pie',
            pieLabel: '1',
            pieLabelClass: 'marker-cluster-pie-label',
            pathClassFunc: function (d) {
                return "category-" + d.data.values.cat;
            },
            pathTitleFunc: function (d) {
                switch (d.data.key) {
                    case 'rest':
                        return 'Normal: ' + d.data.values.percentage + '% / ' + d.data.values.count;
                    case 'late':
                        return 'Verspätet: ' + d.data.values.percentage + '% / ' + d.data.values.count;
                    case 'out':
                        return 'Ausgefallen: ' + d.data.values.percentage + '% / ' + d.data.values.count;
                }
            }
        }),
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
    return L.marker(latlng, {icon: myIcon});
}

function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (n < 10 ? 10 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
        //bake some svg markup
        total = 0,
        late = 0,
        out = 0;
    if (yyyy === 'all' && mm === 'all') {
        children.forEach(function (child) {
            total += child.feature.count.all;
            late += child.feature["latecount" + maxMin]['all'];
            out += child.feature.outcount.all;
        });
    } else if (mm === 'all') {
        children.forEach(function (child) {
            if (yyyy in child.feature['count']) {
                $.each(child.feature['count'][yyyy], function (key, value) {
                    total += value;
                });
            }
            if (yyyy in child.feature["latecount" + maxMin]) {
                $.each(child.feature["latecount" + maxMin][yyyy], function (key, value) {
                    late += value;
                });
            }
            if (yyyy in child.feature['outcount']) {
                $.each(child.feature['outcount'][yyyy], function (key, value) {
                    out += value;
                });
            }
        });
    } else if (yyyy === 'all') {
        children.forEach(function (child) {
            $.each(child.feature.count, function (key, value) {
                if (key !== 'all' && mm in value) total += value[mm];
            });
            $.each(child.feature["latecount" + maxMin], function (key, value) {
                if (key !== 'all' && mm in value) late += value[mm];
            });
            $.each(child.feature.outcount, function (key, value) {
                if (key !== 'all' && mm in value) out += value[mm];
            });
        });
    } else {
        children.forEach(function (child) {
            if (yyyy in child.feature['count'] && mm in child.feature['count'][yyyy]) {
                total += child.feature['count'][yyyy][mm];
            }
            if (yyyy in child.feature["latecount" + maxMin] && mm in child.feature["latecount" + maxMin][yyyy]) {
                late += child.feature["latecount" + maxMin][yyyy][mm];
            }
            if (yyyy in child.feature['outcount'] && mm in child.feature['outcount'][yyyy]) {
                out += child.feature['outcount'][yyyy][mm];
            }
        });
    }
    var data = [{
        key: "rest",
        values: {
            count: total - late - out,
            cat: 4,
            percentage: "" + (100 * ((total - late - out) / total)).toFixed(2) + "%"
        }
    },
        {key: "late", values: {count: late, cat: 2, percentage: "" + (100 * (late / total)).toFixed(2) + "%"}},
        {key: "out", values: {count: out, cat: 1, percentage: "" + (100 * (out / total)).toFixed(2) + "%"}}];
    var html = bakeThePie({
            data: data,
            valueFunc: function (d) {
                return d.values.count;
            },
            strokeWidth: 1,
            outerRadius: r,
            innerRadius: r - 10,
            pieClass: 'cluster-pie',
            pieLabel: n,
            pieLabelClass: 'marker-cluster-pie-label',
            pathClassFunc: function (d) {
                return "category-" + d.data.values.cat;
            },
            pathTitleFunc: function (d) {
                switch (d.data.key) {
                    case 'rest':
                        return 'Normal: ' + d.data.values.percentage + ' / ' + d.data.values.count;
                    case 'late':
                        return 'Verspätet: ' + d.data.values.percentage + ' / ' + d.data.values.count;
                    case 'out':
                        return 'Ausgefallen: ' + d.data.values.percentage + ' / ' + d.data.values.count;
                }
            }
        }),
        //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
}

/*function that generates a svg markup for the pie chart*/
function bakeThePie(options) {
    /*data and valueFunc are required*/
    if (!options.data || !options.valueFunc) {
        return '';
    }
    var data = options.data,
        valueFunc = options.valueFunc,
        r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
        rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
        strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
        pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () {
            return '';
        }, //Class for each path
        pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () {
            return '';
        }, //Title for each path
        pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
        pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
        pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label',//Class for the pie label

        origo = (r + strokeWidth), //Center coordinate
        w = origo * 2, //width and height of the svg element
        h = w,
        donut = d3.layout.pie(),
        arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);

    //Create an svg element
    var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
    //Create the pie chart
    var vis = d3.select(svg)
        .data([data])
        .attr('class', pieClass)
        .attr('width', w)
        .attr('height', h);

    var arcs = vis.selectAll('g.arc')
        .data(donut.value(valueFunc))
        .enter().append('svg:g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + origo + ',' + origo + ')');

    arcs.append('svg:path')
        .attr('class', pathClassFunc)
        .attr('stroke-width', strokeWidth)
        .attr('d', arc)
        .append('svg:title')
        .text(pathTitleFunc);

    vis.append('text')
        .attr('x', origo)
        .attr('y', origo)
        .attr('class', pieLabelClass)
        .attr('text-anchor', 'middle')
        //.attr('dominant-baseline', 'central')
        /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
        .attr('dy', '.3em')
        .text(pieLabel);
    //Return the svg-markup rather than the actual element
    return serializeXmlNode(svg);
}

function defineFeaturePopup(feature, layer) {
    var popupContent = '';

    var restcount,
        restper,
        latecount,
        lateper,
        outcount,
        outper;

    if (yyyy === 'all' && mm === 'all') {
        count = feature["count"]['all'];
        latecount = feature["latecount" + maxMin]['all'];
        outcount = feature.outcount.all;
    } else if (mm === 'all') {
        count = 0;
        if (yyyy in feature['count']) {
            $.each(feature['count'][yyyy], function (key, value) {
                count += value;
            });
        }
        latecount = 0;
        if (yyyy in feature['latecount' + maxMin]) {
            $.each(feature['latecount' + maxMin][yyyy], function (key, value) {
                latecount += value
            });
        }
        outcount = 0;
        if (yyyy in feature['outcount']) {
            $.each(feature['outcount'][yyyy], function (key, value) {
                outcount += value;
            });
        }
    }
    else if (yyyy === 'all') {
        count = 0;
        $.each(feature['count'], function (key, value) {
            if (key !== 'all' && mm in value) count += value[mm];
        });
        latecount = 0;
        $.each(feature['latecount' + maxMin], function (key, value) {
            if (key !== 'all' && mm in value) latecount += value[mm];
        });
        outcount = 0;
        $.each(feature['outcount'], function (key, value) {
            if (key !== 'all' && mm in value) outcount += value[mm];
        });
    } else {
        count = 0;
        if (yyyy in feature["count"] && mm in feature["count"][yyyy]) {
            count += feature["count"][yyyy][mm];
        }

        latecount = 0;
        if (yyyy in feature["late" + maxMin] && mm in feature["late" + maxMin][yyyy]) {
            latecount += feature["late" + maxMin][yyyy][mm];
        }

        outcount = 0;
        if (yyyy in feature['outcount'] && mm in feature['outcount'][yyyy]) {
            outcount += feature['outcount'][yyyy][mm]
        }
    }

    restcount = count - latecount - outcount;
    restper = (100 * (restcount / count)).toFixed(2);
    lateper = (100 * (latecount / count)).toFixed(2);
    outper = (100 * (outcount / count)).toFixed(2);


    popupContent += '<span class="heading">' + feature["name"] + '</span>';
    popupContent += '<span class="attribute"><b>Pünktlich:  </b>' + restper + '% / ' + restcount + '</span>';
    popupContent += '<span class="attribute"><b>Verspätet:  </b>' + lateper + '% / ' + latecount + '</span>';
    popupContent += '<span class="attribute"><b>Ausgefallen:  </b>' + outper + '% / ' + outcount + '</span>';

    popupContent = '<div class="map-popup">' + popupContent + '</div>';
    layer.bindPopup(popupContent, {offset: L.point(0, 0)});
}

function redraw() {
    update();
}

function updateCluster() {
    markerclusters.removeLayer(markers);
    setParams();
    markers = L.geoJson(json, {
        pointToLayer: defineFeature,
        onEachFeature: defineFeaturePopup,
        filter: filterMarkers
    });
    markerclusters.addLayer(markers);
}

function update() {
    // Get Selected Month
    var checked = 'all';
    months.forEach(function (month) {
        if ($('#radio' + month).is(':checked')) {
            checked = month;
        }
    });
    // Reset Months
    $('#month').html('').append(
        '<label class="radio"><input type="radio" id="radiomonthall" name="month" value="all" checked onclick="redraw()">Alle</label>'
    );
    // Get Year
    years.forEach(function (year) {
        // If year is selected
        if ($('#radio' + year).is(':checked')) {
            // Get Months of Year
            monthsOfYear = timejson[year];
            monthsOfYear.forEach(function (month) {
                $('#month').append(
                    '<label class="radio">' +
                    '<input type="radio" name="month" id="radio' + month + '" value="' + month + '" onclick="redraw()"> ' +
                    month + '</label>'
                );
            });
            // Select Month if exist
            if ($('#radio' + checked).length) {
                $('#radio' + checked).prop('checked', true);
            } else {
                $('#radiomonthall').prop('checked', true);
            }
            // DO this after everything else is done
            updateCluster();

        }
    });
    // If all is checked
    if ($('#radioyearall').is(':checked')) {
        months = [];
        // Get Years and Months
        $.each(timejson, function (key, value) {
            months = months.concat(value);
        });
        months.sort();
        months.forEach(function (month) {
            $('#month').append(
                '<label class="radio">' +
                '<input type="radio" name="month" id="radio' + month + '" value="' + month + '" onclick="redraw()"> ' +
                month + '</label>'
            );
        });
        // Check Accordingly Mabye wont work
        if (checked === 'all') $('#radiomonthall').prop('checked', true);
        else $('#radio' + checked).prop('checked', true);
        // DO this after everything else is done
        updateCluster();

    }
}

function filterMarkers(feature) {
    if (yyyy === 'all' && mm === 'all') {
        count = feature["count"]['all'];
    } else if (mm === 'all') {
        count = 0;
        if (yyyy in feature['count']) {
            $.each(feature['count'][yyyy], function (key, value) {
                count += value;
            });
        }
    }
    else if (yyyy === 'all') {
        count = 0;
        $.each(feature['count'], function (key, value) {
            if (key !== 'all' && mm in value) count += value[mm];
        });
    } else {
        count = 0;
        if (yyyy in feature["count"] && mm in feature["count"][yyyy]) {
            count += feature["count"][yyyy][mm];
        }
    }

    return count > 0;
}


/*Helper function*/
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}

/* Remove Duplication with array.concat */
Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};


/* Typeahed listener */
$search.change(function () {
    var current = $search.typeahead("getActive");
    if (current) {
        // Some item from your model is active!
        if (current.name == $search.val()) {
            // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
            markers.eachLayer(function (layer) {
                if (current.name == layer.feature.name) {
                    map.setView(layer._latlng, 20);
                }
            });
        } else {
            // This means it is only a partial match, you can either add a new item
            // or take the active if you don't want new items
        }
    } else {
        // Nothing is active so it is a new value (or maybe empty value)
    }
});