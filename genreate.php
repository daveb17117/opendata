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

    // Count Query
    $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = '.$trainstationnumber;
    $result = pg_query($dbconn,$query);
    $trcount = pg_fetch_row($result)[0];

    if($trcount > 0){
        $versp = -120; // ab wann ist es eine Verspätung
        // Count Qurey for late trains
        $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = '.$trainstationnumber.
            ' AND diff_ankunft < '.$versp . ' AND faellt_aus_tf IS FALSE';
        $result = pg_query($dbconn,$query);
        $latecount = pg_fetch_row($result)[0];
        $latepercentage = round(($latecount / $trcount) * 100,2);

        $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = '.$trainstationnumber.
            ' AND faellt_aus_tf IS TRUE';
        $result = pg_query($dbconn,$query);
        $outcount = pg_fetch_row($result)[0];
        $outpercentage = round(($outcount / $trcount) * 100,2);


        $newjson[$key] = [
            'type'=>'Feature',
            'name'=>$entry['fields']['name'],
            'geometry'=>$entry['geometry'],
            'count'=>intval($trcount),
            'latecount'=>intval($latecount),
            'late'=>$latepercentage,
            'outcount'=>intval($outcount),
            'out'=>$outpercentage
        ];
    }

    echo 100 * (($key + 1) / $entriesyount) .' %';
    echo "\r\n";
}


$output = json_encode($newjson,JSON_UNESCAPED_UNICODE);
file_put_contents( __DIR__.'/tnew.json',$output);

echo 'success';
?>