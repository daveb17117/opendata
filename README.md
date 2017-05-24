# SBB Verspätungen
OpenData Project to Visualize SBB Data

# Data
### Link
The data comes from [here](https://data.sbb.ch/explore/dataset/ist-data-history/)
### Generate JSON file for application
The data from the link above is way to big to use it in an application like ours.
So you need to generate a json file like explained above, to feed the app with data
 - First download the dataset as json file
 - Second create a table in a postgres database

```sql
CREATE TABLE IF NOT EXISTS "ist-daten"."history" (
  "recordid"            VARCHAR(50) NOT NULL PRIMARY KEY,
  "fahrt_bezeichner"    VARCHAR(50),
  "ankunftszeit"        TIMESTAMP,
  "verkehrsmittel_text" VARCHAR(50),
  "bpuic"               INT,
  "betreiber_id"        VARCHAR(50),
  "betriebstag"         DATE,
  "linien_id"           INT,
  "an_prognose_status"  VARCHAR(50),
  "diff_ankunft"        INT,
  "abfahrtsverspatung"  BOOLEAN,
  "lod"                 VARCHAR(50),
  "abfahrtszeit"        TIMESTAMP,
  "ab_prognose_status"  VARCHAR(50),
  "betreiber_abk"       VARCHAR(50),
  "faellt_aus_tf"       BOOLEAN,
  "plan_aufenthalt"     INT,
  "betreiber_name"      VARCHAR(50),
  "ist_aufenthalt"      INT,
  "produkt_id"          VARCHAR(50),
  "zusatzfahrt_tf"      BOOLEAN,
  "geopos"              DOUBLE PRECISION [],
  "durchfahrt_tf"       BOOLEAN,
  "ankunftsverspatung"  BOOLEAN,
  "diff_abfahrt"        INT,
  "ab_prognose"         TIMESTAMP,
  "name"                VARCHAR(50),
  "haltestellen_name"   VARCHAR(50),
  "linien_text"         VARCHAR(50),
  "an_prognose"         TIMESTAMP,
  "record_timestamp"    TIMESTAMP
);
```
- Third run insert script which is included in this repository; The json file, the script and the sql file should be in the same folder. Make sure to replace <password> and <scirpt_dir> frist
```
$ ./insert.sh <json-file> insert.sql
```
- Frouth Wait!: This will take a lot of time because the json file is very big, so you have to be patient
- Fifth run the json generation script (not yet ready)





