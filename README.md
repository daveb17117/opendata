# SBB Verspätungen
OpenData Project to Visualize SBB Data about Train Punctuality

![image unavailable](/ressources/fullMap.png "SBB Verspätungen")

# Using the Application
### Markers
The Application shows marker icons on a Swiss Map.   
A marker represent a number of train stations in a certain region. You can see the region by moving your mouse on the 
marker. The number in the middle tells you how many train stations are in that region.   
The circle of the marker shows you information about how many trains arriving at these train stations are on time, late 
or got cancelled. Green is on time, orange late and red cancelled as you can see in the legend on the bottom left. To 
get the exact number and percentage of punctual, late and cancelled trains, simply move your mouse on the respectively 
colored part of the circle and wait for the mouseover (tooltip) to appear.  
If you click on a marker, the map will zoom in on the corresponding region and the markers will be redistributed 
dynamically. If you click on a marker representing only one train station, a pop-up will appear containing the name of 
the station and the absolute and relative number of punctual, late and cancelled trains. 
 
### Filter Options
#### Filter by minutes
You can select how many minutes (1, 2, 3 or 4) a train needs to be late to be considered late by the application. The 
SBB standard is 3 minutes, so if a train arrives 2 minutes later than scheduled, it would still be considered to be on 
time by SBB.
### Filter by Year/Month
You can select to only show data from certain months and years.

# Data
### Link
The data comes from the [IST-data-history on data.sbb.ch](https://data.sbb.ch/explore/dataset/ist-data-history/).  
You can have a look at the JSON files our application uses in the data folder of this repo.  
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
- Fourth Wait!: This will take a lot of time because the json file is very big, so you have to be patient
- Fifth run the json generation script (not yet ready)





