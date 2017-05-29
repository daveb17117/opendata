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
    markers,
    json;

//Add basemap
L.tileLayer(tileServer, {attribution: tileAttribution + copyLeft, maxZoom: 15}).addTo(map);
//and the empty markercluster layer
map.addLayer(markerclusters);

// Gets all Trainstations
$.getJSON('data/data.json', function (geojson) {
    json = geojson;
    markers = L.geoJson(geojson, {
        pointToLayer: defineFeature,
        onEachFeature: defineFeaturePopup
    });
    markerclusters.addLayer(markers);
    map.fitBounds(markers.getBounds());
});

function defineFeature(feature, latlng) {
    var maxMin = 2;
    if (document.getElementById('radio1min').checked)
        maxMin = 1;
    else if (document.getElementById('radio2min').checked)
        maxMin = 2;
    else if (document.getElementById('radio3min').checked)
        maxMin = 3;
    else if (document.getElementById('radio4min').checked)
        maxMin = 4;
    var strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (1 < 10 ? 12 : 1 < 100 ? 8 : 1 < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
        data = [{key: "rest", values: {count: feature["count"]['all'] - feature["latecount" + maxMin]['all'] - feature.outcount.all, cat: 4, percentage: (100 - feature["late" + maxMin] - feature.out).toFixed(2)}},
            {key: "late", values: {count: feature["latecount" + maxMin]['all'], cat: 2, percentage: (feature["late" + maxMin]['all']).toFixed(2)}},
            {key: "out", values: {count: feature.outcount.all, cat: 1, percentage: (feature.out.all).toFixed(2)}}],
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
                switch(d.data.key){
                    case 'rest': return 'Normal: '+ d.data.values.percentage + '% / ' + d.data.values.count;
                    case 'late': return 'Verspätet: '+ d.data.values.percentage + '% / ' + d.data.values.count;
                    case 'out': return 'Ausgefallen: ' + d.data.values.percentage + '% / ' + d.data.values.count;
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
    var maxMin = 2;
    if (document.getElementById('radio1min').checked)
        maxMin = 1;
    else if (document.getElementById('radio2min').checked)
        maxMin = 2;
    else if (document.getElementById('radio3min').checked)
        maxMin = 3;
    else if (document.getElementById('radio4min').checked)
        maxMin = 4;
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (n < 10 ? 10 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
        //bake some svg markup
        total = 0,
        late = 0,
        out = 0;
    children.forEach(function (child) {
        total += child.feature.count.all;
        late += child.feature["latecount" + maxMin]['all'];
        out += child.feature.outcount.all;
    });
    var data = [{key: "rest", values: {count: total - late - out, cat: 4, percentage: "" + (100 * ((total - late - out)/total)).toFixed(2) + "%"}},
        {key: "late", values: {count: late, cat: 2, percentage: "" + (100 * (late/total)).toFixed(2) + "%"}},
        {key: "out", values: {count: out, cat: 1, percentage: "" + (100 * (out/total)).toFixed(2) + "%"}}];
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
                switch(d.data.key){
                    case 'rest': return 'Normal: '+ d.data.values.percentage + ' / ' + d.data.values.count;
                    case 'late': return 'Verspätet: '+ d.data.values.percentage + ' / ' + d.data.values.count;
                    case 'out': return 'Ausgefallen: ' + d.data.values.percentage + ' / ' + d.data.values.count;
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

    var maxMin = 0;
    if ($("#radio1min").is(":checked"))
        maxMin = 1;
    if ($("#radio2min").is(":checked"))
        maxMin = 2;
    if ($("#radio3min").is(":checked"))
        maxMin = 3;
    if ($("#radio4min").is(":checked"))
        maxMin = 4;

    popupContent += '<span class="heading">' + feature["name"] + '</span>';
    popupContent += '<span class="attribute"><b>Pünktlich:  </b>'+ (100 - feature["late" + maxMin]['all'] - feature["out"]['all']).toFixed(2) +'% / ' + (feature["count"]['all'] - feature["latecount" + maxMin]['all'] - feature["outcount"]['all']) + '</span>';
    popupContent += '<span class="attribute"><b>Verspätet:  </b>'+ feature["late" + maxMin]['all'].toFixed(2) +'% / ' + feature["latecount" + maxMin]['all'] + '</span>';
    popupContent += '<span class="attribute"><b>Ausgefallen:  </b>'+ feature["out"]['all'].toFixed(2) +'% / ' + feature["outcount"]['all'] + '</span>';

    popupContent = '<div class="map-popup">' + popupContent + '</div>';
    layer.bindPopup(popupContent, {offset: L.point(0, 0)});
}

function redraw() {
    markerclusters.removeLayer(markers);
    markers = L.geoJson(json, {
        pointToLayer: defineFeature,
        onEachFeature: defineFeaturePopup
    });
    markerclusters.addLayer(markers);
    //defineFeature();
    //defineClusterIcon();
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

$search.change(function() {
    var current = $search.typeahead("getActive");
    if (current) {
        // Some item from your model is active!
        if (current.name == $search.val()) {
            // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
            markers.eachLayer(function (layer) {
                if(current.name == layer.feature.name){
                    map.setView(layer._latlng,20);
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