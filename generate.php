<?php

function microtime_float()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}

$time_start = microtime_float();


// Connect to Database
$dbconn = pg_connect('host=daveb17117.ch dbname=sbb user=sbb password=TdsBb_ApP');
if (!$dbconn) {
    echo "Verbindung konnte nicht hergestellt werden";
    exit;
}

// Biggest Date
$query = 'SELECT DISTINCT betriebstag FROM "ist-daten".history WHERE geopos IS NOT NULL ORDER BY betriebstag DESC LIMIT 1';
$result = pg_query($dbconn, $query);
$hdate = pg_fetch_row($result)[0];

// Lowest Date
$query = 'SELECT DISTINCT betriebstag FROM "ist-daten".history WHERE geopos IS NOT NULL ORDER BY betriebstag ASC LIMIT 1';
$result = pg_query($dbconn, $query);
$ldate = pg_fetch_row($result)[0];

// Get biggest and lowest Month
$hmonth = substr($hdate, 5, 2);
$lmonth = substr($ldate, 5, 2);

// Get years and months
$hyear = substr($hdate, 0, 4);
$lyear = substr($ldate, 0, 4);
$years = [];

// Genreate Array with Year and Months to loop over
for ($i = $lyear; $i <= $hyear; $i++) {
    $months = [];
    $from = 1;
    $to = 12;
    if ($i == $hyear) {
        $from = 1;
        $to = $hmonth;
    } elseif ($i == $lyear) {
        $from = $lmonth;
        $to = 12;
    } else {
        $from = 1;
        $to = 12;
    }
    for ($j = $from; $j <= $to; $j++) {
        $months[] = str_pad($j, 2, '0', STR_PAD_LEFT);
    }
    $years[$i] = $months;
}

// Get Trainstations which are in the database
$query = 'SELECT DISTINCT ON(bpuic) bpuic, haltestellen_name, geopos FROM "ist-daten".history WHERE geopos IS NOT NULL';
$result_ts = pg_query($dbconn, $query);
$newjson = [];
$entriescount = pg_num_rows($result_ts);
$itrcount = 1;
while ($row = pg_fetch_row($result_ts)) {
    $trainstationnumber = intval($row[0]);


    // Count Query
    $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber;
    $result = pg_query($dbconn, $query);
    $trcount = pg_fetch_row($result)[0];

    if ($trcount > 0) {
        $entry = [];
        // Loop over years and months
        foreach ($years as $year => $months) {
            foreach ($months as $month) {
                // Count Query
                $query = 'SELECT COUNT(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber .
                    ' AND betriebstag::text LIKE \'' . $year . '-' . $month . '-%\'';
                $result = pg_query($dbconn, $query);
                $count = pg_fetch_row($result)[0];

                if ($count > 0) {
                    for ($k = 0; $k < 2; $k++) {
                        for ($i = 1; $i < 5; $i++) {
                            $field = $k === 0 ? 'diff_abfahrt' : 'diff_ankunft';
                            $versp = -60 * $i;
                            $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber .
                                ' AND ' . $field . ' < ' . $versp . ' AND faellt_aus_tf IS FALSE AND betriebstag::text LIKE \'' . $year . '-' . $month . '-%\'';
                            $result = pg_query($dbconn, $query);
                            $latecount = pg_fetch_row($result)[0];
                            $latecountpercentage = round(($latecount / $trcount) * 100, 2);
                            $entry[$field]['latecount' . $i][$year][$month] = intval($latecount);
                            $entry[$field]['late' . $i][$year][$month] = $latecountpercentage;
                        }
                    }

                    $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber .
                        ' AND faellt_aus_tf IS TRUE AND betriebstag::text LIKE \'' . $year . '-' . $month . '-%\'';
                    $result = pg_query($dbconn, $query);
                    $outcount = pg_fetch_row($result)[0];
                    $outpercentage = round(($outcount / $trcount) * 100, 2);


                    $entry['count'][$year][$month] = intval($count);
                    $entry['outcount'][$year][$month] = intval($outcount);
                    $entry['out'][$year][$month] = $outpercentage;
                }
            }
        }

        for ($k = 0; $k < 2; $k++) {
            for ($i = 1; $i < 5; $i++) {
                $field = $k === 0 ? 'diff_abfahrt' : 'diff_ankunft';
                $versp = -60 * $i;
                $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber .
                    ' AND ' . $field . ' < ' . $versp . ' AND faellt_aus_tf IS FALSE';
                $result = pg_query($dbconn, $query);
                $latecount = pg_fetch_row($result)[0];
                $latecountpercentage = round(($latecount / $trcount) * 100, 2);
                $entry[$field]['latecount' . $i]['all'] = intval($latecount);
                $entry[$field]['late' . $i]['all'] = $latecountpercentage;
            }
        }

        $query = 'SELECT count(*) FROM "ist-daten".history WHERE bpuic = ' . $trainstationnumber .
            ' AND faellt_aus_tf IS TRUE';
        $result = pg_query($dbconn, $query);
        $outcount = pg_fetch_row($result)[0];
        $outpercentage = round(($outcount / $trcount) * 100, 2);

        $geopos = explode(',', str_replace('}', '', str_replace('{', '', $row[2])));


        $entry['type'] = 'Feature';
        $entry['name'] = $row[1];
        $entry['geometry'] = ["type" => "Point", "coordinates" => [floatval($geopos[1]), floatval($geopos[0])]];
        $entry['count']['all'] = intval($trcount);
        $entry['outcount']['all'] = intval($outcount);
        $entry['out']['all'] = $outpercentage;

        $newjson[] = $entry;
    }

    echo 100 * ($itrcount / $entriescount) . ' %';
    echo "\r\n";
    $itrcount++;
}

// Write Data JSON
$output = json_encode($newjson, JSON_UNESCAPED_UNICODE);
file_put_contents(__DIR__ . '/data/data.json', $output);

// Write JSON with years and months for filter
$output2 = json_encode($years, JSON_UNESCAPED_UNICODE);
file_put_contents(__DIR__ . '/data/time.json', $output2);

$time_end = microtime_float();
$time = $time_end - $time_start;

echo 'Completed in ' . $time / 60 . ' minutes';
?>