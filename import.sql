BEGIN;
-- let's create a temp table to bulk data into
CREATE TEMPORARY TABLE temp_json (
  values TEXT
) ON COMMIT DROP;
COPY temp_json FROM :'file';

-- insert data into table
INSERT INTO "ist-daten"."history" (
  "recordid", "fahrt_bezeichner", "ankunftszeit", "verkehrsmittel_text",
  "bpuic", "betreiber_id", "betriebstag", "linien_id", "an_prognose_status", "diff_ankunft", "abfahrtsverspatung",
  "lod", "abfahrtszeit", "ab_prognose_status", "betreiber_abk", "faellt_aus_tf", "plan_aufenthalt", "betreiber_name",
  "ist_aufenthalt", "produkt_id", "zusatzfahrt_tf", "geopos", "durchfahrt_tf", "ankunftsverspatung", "diff_abfahrt",
  "ab_prognose", "name", "haltestellen_name", "linien_text", "an_prognose", "record_timestamp")
SELECT
  replace(cast(values -> 'recordid' AS VARCHAR(50)), '"', '')                           AS recordid,
  replace(cast(values -> 'fields' -> 'fahrt_bezeichner' AS VARCHAR(50)), '"', '')       AS fahrt_bezeichner,
  cast(values -> 'fields' -> 'ankunftszeit' AS TEXT) :: TIMESTAMP                       AS ankunftszeit,
  replace(cast(values -> 'fields' -> 'verkehrsmittel_text' AS VARCHAR(50)), '"', '')    AS verkehrsmittel_text,
  cast(values -> 'fields' -> 'bpuic' AS TEXT) :: INT                                    AS bpuic,
  replace(cast(values -> 'fields' -> 'betreiber_id' AS VARCHAR(50)), '"', '')           AS betreiber_id,
  cast(values -> 'fields' -> 'betriebstag' AS TEXT) :: DATE                             AS betriebstag,
  cast(values -> 'fields' -> 'linien_id' AS TEXT) :: INT                                AS linien_id,
  replace(cast(values -> 'fields' -> 'an_prognose_status' AS VARCHAR(50)), '"', '')     AS an_prognose_status,
  cast(values -> 'fields' -> 'diff_ankunft' AS TEXT) :: INT                             AS diff_ankunft,
  replace(cast(values -> 'fields' -> 'abfahrtsverspatung' AS TEXT), '"', '') :: BOOLEAN AS abfahrtsverspatung,
  replace(cast(values -> 'fields' -> 'lod' AS VARCHAR(50)), '"', '')                    AS lod,
  cast(values -> 'fields' -> 'abfahrtszeit' AS TEXT) :: TIMESTAMP                       AS abfahrtszeit,
  replace(cast(values -> 'fields' -> 'ab_prognose_status' AS VARCHAR(50)), '"', '')     AS ab_prognose_status,
  replace(cast(values -> 'fields' -> 'betreiber_abk' AS VARCHAR(50)), '"', '')          AS betreiber_abk,
  replace(cast(values -> 'fields' -> 'faellt_aus_tf' AS TEXT), '"', '') :: BOOLEAN      AS faellt_aus_tf,
  cast(values -> 'fields' -> 'plan_aufenthalt' AS TEXT) :: INT                          AS plan_aufenthalt,
  replace(cast(values -> 'fields' -> 'betreiber_name' AS VARCHAR(50)), '"', '')         AS betreiber_name,
  cast(values -> 'fields' -> 'ist_aufenthalt' AS TEXT) :: INT                           AS ist_aufenthalt,
  replace(cast(values -> 'fields' -> 'produkt_id' AS VARCHAR(50)), '"', '')             AS produkt_id,
  replace(cast(values -> 'fields' -> 'zusatzfahrt_tf' AS TEXT), '"', '') :: BOOLEAN     AS zusatzfahrt_tf,
  string_to_array(
      replace(
          replace(
              cast(values -> 'fields' -> 'geopos' AS TEXT),
              '[', ''), ']', ''), ',') :: DOUBLE PRECISION []                           AS geopos,
  replace(cast(values -> 'fields' -> 'durchfahrt_tf' AS TEXT), '"', '') :: BOOLEAN      AS durchfahrt_tf,
  replace(cast(values -> 'fields' -> 'ankunftsverspatung' AS TEXT), '"', '') :: BOOLEAN AS ankunftsverspatung,
  cast(values -> 'fields' -> 'diff_abfahrt' AS TEXT) :: INT                             AS diff_abfahrt,
  cast(values -> 'fields' -> 'ab_prognose' AS TEXT) :: TIMESTAMP                        AS ab_prognose,
  replace(cast(values -> 'fields' -> 'name' AS VARCHAR(50)), '"', '')                   AS name,
  replace(cast(values -> 'fields' -> 'haltestellen_name' AS VARCHAR(50)), '"', '')      AS haltestellen_name,
  replace(cast(values -> 'fields' -> 'linien_text' AS VARCHAR(50)), '"', '')            AS linien_text,
  cast(values -> 'fields' -> 'an_prognose' AS TEXT) :: TIMESTAMP                        AS an_prognose,
  cast(values -> 'record_timestamp' AS TEXT) :: TIMESTAMP                               AS record_timestamp
FROM (
       SELECT json_array_elements(replace(values, '\', '\\') :: JSON) AS values
       FROM temp_json
     ) a;

COMMIT;