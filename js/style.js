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


/* Title Transition */
$('#title').css('opacity','1');
$('#closetitle').on('click',function () {
    $('#title').css('opacity','0');
    setTimeout(function () {
      $('#title').hide().css('z-index','-1');
    },1000);
});
