#!/bin/sh
#dir = $(dirname $0)
# pgpassword
export PGPASSWORD=<password>
# create directory
mkdir -p parts/

# create files with 10'000 entries in folder parts
# The stream is necessery because the input file is very big
cat $1 | jq -cn --stream 'fromstream(1|truncate_stream(inputs))' | split -l 10000 - parts/
echo "Created Parts"
# For each created file do
for file in "parts/"* ; do
  # Replace newlines with comma
  sed -i ':a;N;$!ba;s/\n/,/g' "$file"
  # Insert '[' at the beginning
  sed -i '1s/^/[/' "$file"
  # Insert ']' at the end
  sed -i 's/$/]/' "$file"
  # Insert into database
  psql -U postgres -h 127.0.0.1 -d sbb -v file=<script_dir>/$file -a -f import.sql
done
echo "Finished"
