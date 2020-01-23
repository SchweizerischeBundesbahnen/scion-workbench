#!/bin/bash

TRAVIS_BUILD_DIR=$1
DIST_DIR=$2
NOW_TOKEN=$3

echo "Change directory: $DIST_DIR"
cd $TRAVIS_BUILD_DIR/$DIST_DIR

echo "Deploying '$DIST_DIR' to now 'https://zeit.co/scion'"
$TRAVIS_BUILD_DIR/node_modules/.bin/now deploy --token $NOW_TOKEN --scope scion && $TRAVIS_BUILD_DIR/node_modules/.bin/now alias --token $NOW_TOKEN --scope scion

echo "Change directory: $TRAVIS_BUILD_DIR"
cd $TRAVIS_BUILD_DIR
