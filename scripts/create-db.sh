#!/usr/bin/env bash

echo 'Checking wordnet SQL files...'

ls ./tmp/wordnet/ || 'Please add wordnet sql files to tmp/wordnet'

echo 'Creating mysql docker container...'

docker network create mysql-tmp

docker run --rm -d -p 3306:3306 \
  --name mysql-tmp \
  -e MYSQL_ROOT_PASSWORD=secret \
  --mount type=tmpfs,destination=/var/lib/mysql \
  mysql:latest

# sleep 30

echo 'Creating database...'

echo 'CREATE DATABASE wordnet;' | \
docker exec -i \
  mysql-tmp mysql -psecret

echo 'Loading schema...'

docker exec -i \
  mysql-tmp \
  mysql -psecret wordnet \
  < tmp/wordnet/mysql-wn-schema.sql

echo 'Loading data...'

docker exec -i \
  mysql-tmp \
  mysql -psecret wordnet \
  < tmp/wordnet/mysql-wn-data.sql

docker exec -i \
  mysql-tmp \
  mysql -psecret wordnet \
  < tmp/wordnet/mysql-wn-views.sql

echo 'Dumping all data...'

docker exec \
  mysql-tmp \
  mysqldump -psecret wordnet \
  > tmp/wordnet/mysql-wn-all.sql

echo 'Converting data...'

./scripts/mysql2sqlite tmp/wordnet/mysql-wn-all.sql > data/sqlite-wordnet.sql

echo 'Stopping mysql docker container...'

docker container stop mysql-tmp

echo 'Done'