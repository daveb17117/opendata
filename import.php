<?php
require __DIR__ . "/vendor/autoload.php";

class ItemProcessor
{

    var $conn;
    var $count = 0;

    function __construct($connection_string)
    {
        $this->conn = pg_connect($connection_string);
    }

    function escape($string)
    {
        if ($string === '' || $string === NULL || $string === '{,}') {
            return 'NULL';
        }
        return '\'' . pg_escape_string($this->conn,$string) . '\'';
    }

    public function process(array $item)
    {
        $query = "
INSERT INTO \"ist-daten\".history (
  \"recordid\", \"fahrt_bezeichner\", \"ankunftszeit\", \"verkehrsmittel_text\",
  \"bpuic\", \"betreiber_id\", \"betriebstag\", \"linien_id\", \"an_prognose_status\", \"diff_ankunft\", \"abfahrtsverspatung\",
  \"lod\", \"abfahrtszeit\", \"ab_prognose_status\", \"betreiber_abk\", \"faellt_aus_tf\", \"plan_aufenthalt\", \"betreiber_name\",
  \"ist_aufenthalt\", \"produkt_id\", \"zusatzfahrt_tf\", \"geopos\", \"durchfahrt_tf\", \"ankunftsverspatung\", \"diff_abfahrt\",
  \"ab_prognose\", \"name\", \"haltestellen_name\", \"linien_text\", \"an_prognose\", \"record_timestamp\")
  SELECT
  " . $this->escape($item["recordid"]?? NULL) . "                                  AS recordid,
  " . $this->escape($item["fields"]["fahrt_bezeichner"] ?? NULL) . "               AS fahrt_bezeichner,
  " . $this->escape($item["fields"]["ankunftszeit"] ?? NULL) . "                   AS ankunftszeit,
  " . $this->escape($item["fields"]["verkehrsmittel_text"] ?? NULL) . "            AS verkehrsmittel_text,
  " . $this->escape($item["fields"]["bpuic"] ?? NULL) . "                          AS bpuic,
  " . $this->escape($item["fields"]["betreiber_id"] ?? NULL) . "                   AS betreiber_id,
  " . $this->escape($item["fields"]["betriebstag"] ?? NULL) . "                    AS betriebstag,
  " . $this->escape($item["fields"]["linien_id"] ?? NULL) . "                      AS linien_id,
  " . $this->escape($item["fields"]["an_prognose_status"] ?? NULL) . "             AS an_prognose_status,
  " . $this->escape($item["fields"]["diff_ankunft"] ?? NULL) . "                   AS diff_ankunft,
  " . $this->escape($item["fields"]["abfahrtsverspatung"] ?? NULL) . "             AS abfahrtsverspatung,
  " . $this->escape($item["fields"]["lod"] ?? NULL) . "                            AS lod,
  " . $this->escape($item["fields"]["abfahrtszeit"] ?? NULL) . "                   AS abfahrtszeit,
  " . $this->escape($item["fields"]["ab_prognose_status"] ?? NULL) . "             AS ab_prognose_status,
  " . $this->escape($item["fields"]["betreiber_abk"] ?? NULL) . "                  AS betreiber_abk,
  " . $this->escape($item["fields"]["faellt_aus_tf"] ?? NULL) . "                  AS faellt_aus_tf,
  " . $this->escape($item["fields"]["plan_aufenthalt"] ?? NULL) . "                AS plan_aufenthalt,
  " . $this->escape($item["fields"]["betreiber_name"] ?? NULL) . "                 AS betreiber_name,
  " . $this->escape($item["fields"]["ist_aufenthalt"] ?? NULL) . "                 AS ist_aufenthalt,
  " . $this->escape($item["fields"]["produkt_id"] ?? NULL) . "                     AS produkt_id,
  " . $this->escape($item["fields"]["zusatzfahrt_tf"] ?? NULL) . "                 AS zusatzfahrt_tf,
  " . $this->escape(isset($item["fields"]["geopos"]) ?
                '{' . $item["fields"]["geopos"][0] . ',' . $item["fields"]["geopos"][1] . '}' : '{,}') . "  AS geopos,
  " . $this->escape($item["fields"]["durchfahrt_tf"] ?? NULL) . "                  AS durchfahrt_tf,
  " . $this->escape($item["fields"]["ankunftsverspatung"] ?? NULL) . "             AS ankunftsverspatung,
  " . $this->escape($item["fields"]["diff_abfahrt"] ?? NULL) . "                   AS diff_abfahrt,
  " . $this->escape($item["fields"]["ab_prognose"] ?? NULL) . "                    AS ab_prognose,
  " . $this->escape($item["fields"]["name"] ?? NULL) . "                           AS name,
  " . $this->escape($item["fields"]["haltestellen_name"] ?? NULL) . "              AS haltestellen_name,
  " . $this->escape($item["fields"]["linien_text"] ?? NULL) . "                    AS linien_text,
  " . $this->escape($item["fields"]["an_prognose"] ?? NULL) . "                    AS an_prognose,
" . $this->escape($item["record_timestamp"] ?? NULL) . "                           AS record_timestamp" . "
  WHERE NOT EXISTS(SELECT recordid FROM \"ist-daten\".history WHERE recordid = " . $this->escape($item["recordid"] ?? NULL) . ")";

        $result = pg_query($this->conn, $query);

        if ($result) {
            echo $this->count;
            echo "\r\n";
            $this->count++;
        }
    }
}


$parser = new \JsonCollectionParser\Parser();
$processor = new ItemProcessor('host=daveb17117.ch dbname=sbb user=sbb password=TdsBb_ApP');
$parser->parse(__DIR__ . '/ist-daten-history.json', [$processor, 'process']);