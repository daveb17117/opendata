<?php
// Connect to Database
$dbconn = pg_connect('host=daveb17117.ch dbname=sbb user=sbb password=TdsBb_ApP');
if(!$dbconn){
    echo "Verbindung konnte nicht hergestellt werden";
    exit;
}

// Get Trainstations which are in the database
$query = 'SELECT DISTINCT ON(bpuic) bpuic, haltestellen_name, geopos FROM "ist-daten".history WHERE geopos IS NOT NULL';
$result_ts = pg_query($dbconn,$query);
$newjson = [];
$entriescount = pg_num_rows($result_ts);
$itrcount = 1;
while($row = pg_fetch_row($result_ts)){
    $trainstationnumber = intval($row[0]);

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

        $geopos = explode(',',str_replace('}','',str_replace('{','',$row[2])));


        $newjson[] = [
            'type'=>'Feature',
            'name'=>$row[1],
            'geometry'=>["type"=>"Point","coordinates"=>[floatval($geopos[1]),floatval($geopos[0])]],
            'count'=>intval($trcount),
            'latecount'=>intval($latecount),
            'late'=>$latepercentage,
            'outcount'=>intval($outcount),
            'out'=>$outpercentage
        ];
    }

    echo 100 * ($itrcount / $entriescount) .' %';
    echo "\r\n";
    $itrcount++;
}

$output = json_encode($newjson,JSON_UNESCAPED_UNICODE);
file_put_contents( __DIR__.'/trial.json',$output);

echo 'success';
?>