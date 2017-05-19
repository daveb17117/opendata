/*
 * Makes the map responsive
 * */
var mapmargin = 50;
$('#map').css("height", ($(window).height()));
$(window).on("resize", resize);
resize();
function resize(){
    var map = $('#map');
    map.css("height", ($(window).height()));
}


/*
Documentation:
 http://leafletjs.com/examples/geojson/
 https://github.com/Leaflet/Leaflet.markercluster
 */


/**
 * Calculates Data for Trainstations
 */
function aggregate() {
    $.getJSON('trainstation.json',function (json) {

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
query('didok-liste', 2000, '', [], {tunummer : 1}, function (data) {
    geojson = data.records;
    // Inject Type for L.geojson to work
    geojson.forEach(function (element){element.type = 'Feature'});
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
        /*        data = d3.nest() //Build a dataset for the pie chart
         .key(function (d) {
         return d.feature.properties[categoryField];
         })
         .entries(children, d3.map),*/
        //bake some svg markup
        html = '2', /* bakeThePie({
         data: data,
         valueFunc: function (d) {
         return d.values.length;
         },
         strokeWidth: 1,
         outerRadius: r,
         innerRadius: r - 10,
         pieClass: 'cluster-pie',
         pieLabel: n,
         pieLabelClass: 'marker-cluster-pie-label',
         pathClassFunc: function (d) {
         return "category-" + d.data.key;
         },
         pathTitleFunc: function (d) {
         return metadata.fields[categoryField].lookup[d.data.key] + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')';
         }
         }),*/
        //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
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
    for(var propertyName in refine) {
        if(refine.hasOwnProperty(propertyName)){
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