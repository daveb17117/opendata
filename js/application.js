/*
 * Makes the map responsive
 * */
var mapmargin = 50;
$('#map').css("height", ($(window).height()));
$(window).on("resize", resize);
resize();
function resize() {
    var map = $('#map');
    map.css("height", ($(window).height()));
}

var geojson,
    metadata,
    tileServer = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    tileAttribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    rmax = 30, //Maximum radius for cluster pies
    markerclusters = L.markerClusterGroup({
        maxClusterRadius: 2 * rmax,
        iconCreateFunction: defineClusterIcon //this is where the magic happens
    }),
    map = L.map('map').setView([46.6, 8.1], 8);

//Add basemap
L.tileLayer(tileServer, {attribution: tileAttribution, maxZoom: 15}).addTo(map);
//and the empty markercluster layer
map.addLayer(markerclusters);

// Gets all Trainstations
$.getJSON('tnew.json', function (geojson) {
    var markers = L.geoJson(geojson);
    markerclusters.addLayer(markers);
    map.fitBounds(markers.getBounds());
});

function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
        //bake some svg markup
        total = 0,
        late = 0,
        out = 0;
    children.forEach(function (child) {
        total += child.feature.count;
        late += child.feature.latecount;
        out += child.feature.outcount;
    });
    var data = [{key: "total", values: {count: total, cat: 4}},
        {key: "late", values: {count: late, cat: 2}},
        {key: "out", values: {count: out, cat: 1}}];
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

/*Helper function*/
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}


/* Queries the sbb api and calls the handleData on the resulting JSON-file
 * @param query – The query to be made on the data set.
 * @param handleData – (name of) the function to be called
 * */
function query(dataset, rows, query, facet, refine, handleData) {
    // Create Object for querystring creation
    var dataobject = {
        dataset: dataset,
        rows: rows,
        lang: 'de',
        q: query,
        facet: facet,
        apikey: '7598831a268919cfd9ec4cc8cdfd5293cf312113773e60d5d459f2e1'
    };

    // Add refines (needs to be a javascript object)
    // example: {tunummer: 1}
    for (var propertyName in refine) {
        if (refine.hasOwnProperty(propertyName)) {
            dataobject['refine.' + propertyName] = refine[propertyName];

        }
    }

    // Builds Querystring
    var data = $.param(dataobject, true);

    // Makes request for data
    $.ajax({
        url: 'https://data.sbb.ch/api/records/1.0/search/?',
        jsonp: 'callback',
        dataType: 'jsonp',
        data: data,
        // response is the resulting JSON file
        success: function (response) {
            handleData(response);
        }
    });
}

/**
 * Creates a trainstation.json file (not working in PHPStorm)
 */
function fetch() {
    // Fetch Data if not already fetched. This should happen one time daily
// Trainstations
    query('didok-liste', 2000, '', [], {tunummer: 1}, function (data) {
        geojson = data.records;
        // Inject Type for L.geojson to work
        geojson.forEach(
            function (element) {
                element.type = 'Feature';
            });
        $.post("json.php", {json: JSON.stringify(geojson)}).done(function (data) {
            console.log(data);
        });
        /*        $.ajax({
         type: "POST",
         url: "json.php",
         data: {
         json: JSON.stringify(geojson)
         },
         success: function (response) {
         alert(response);
         }
         });*/
    });

// Ist-Daten (Vortag)


// Ist-Daten history
}