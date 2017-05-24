<?php
// Connect to Database
$dbconn = pg_connect('host=daveb17117.ch dbname=sbb user=sbb password=TdsBb_ApP');
if(!$dbconn){
    echo "Verbindung konnte nicht hergestellt werden";
    exit;
}

// Get Trainstation JSON as array
$tsstring = file_get_contents(__DIR__.'/trainstation.json');
$json = json_decode($tsstring,true);

$newjson = [];
$entriesyount = count($json);
foreach($json as $key => $entry){
    $trainstationnumber = $entry['fields']['nummer'];
    $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = '.$trainstationnumber;
    $result = pg_query($dbconn,$query);
    $trcount = pg_fetch_row($result)[0];
    $newjson[$key] = [
        'type'=>'Feature',
        'name'=>$entry['fields']['name'],
        'geometry'=>$entry['geometry'],
        'count'=>intval($trcount)
    ];
    echo 100 * (($key + 1) / $entriesyount) .' %';
    echo "\r\n";
}


$output = json_encode($newjson,JSON_UNESCAPED_UNICODE);
file_put_contents( __DIR__.'/tnew.json',$output);

echo 'success';






/*$dbconn = pg_connect('host=daveb17117.ch dbname=sbb user=sbb password=TdsBb_ApP');
if(!$dbconn){
    echo "Verbindung konnte nicht hergestellt werden";
    exit;
}
$result = pg_query($dbconn,'SELECT count(*) FROM "ist-daten"."history"');
if(!$result){
    echo "Keine Resultate erhalten";
    exit;
}
while($row = pg_fetch_row($result)){
    echo $row[0];
}*/
?>