<?php
header('Content-type: application/html');
var_dump($_POST);
var_dump($_GET);
if (isset($_POST['json'])) {
    $json = $_POST['json'];
    /* sanity check */
    if (json_decode($json) != null) {
        $file = fopen('trainstation.json', 'w+');
        fwrite($file, $json);
        fclose($file);
        echo 'success';
    } else {
        echo 'failure';
    }
}
?>