#!/bin/bash

TRAVIS_BUILD_DIR=$1
DIST_DIR=$2

echo "Change directory: $DIST_DIR"
cd $TRAVIS_BUILD_DIR/$DIST_DIR
