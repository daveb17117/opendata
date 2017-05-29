/* Makes the map responsive */
var mapmargin = 50;
$('#map').css("height", ($(window).height()));
$(window).on("resize", resize);
resize();
function resize() {
    var map = $('#map');
    map.css("height", ($(window).height()));
}

$search = $('#search_input');

/* set position so you could see the sidebar*/
function openNav() {
    $('#mySidenav').css('right','0');
    $search.typeahead({source: json},'json').focus();
}

/* Set position so the sidebar is hidden again */
function closeNav() {
    $('#mySidenav').css('right','-400px');
    $search.typeahead('disable');
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



/* Title Transition */
$('#title').css('opacity','1');
$('#closetitle').on('click',function () {
    $('#title').css('opacity','0');
    setTimeout(function () {
      $('#title').hide().css('z-index','-1');
    },1000);
});
