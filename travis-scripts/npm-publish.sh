#!/bin/bash

TRAVIS_BUILD_DIR=$1
DIST_DIR=$2
NPM_TOKEN=$3
ARGS=$4

echo "Change directory: $DIST_DIR"
cd $TRAVIS_BUILD_DIR/$DIST_DIR

echo "Publishing '$DIST_DIR' to NPM registry 'registry.npmjs.org'"

# login
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

# publish
npm publish $ARGS

echo "Change directory: $TRAVIS_BUILD_DIR"
cd $TRAVIS_BUILD_DIR
