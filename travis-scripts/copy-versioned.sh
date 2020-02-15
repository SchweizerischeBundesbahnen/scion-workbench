#!/bin/bash

PACKAGE_JSON=$1
SOURCE=$2
TARGET=$3
VERSION=$(cat $PACKAGE_JSON | sed 's/.*"version": "\(.*\)".*/\1/;t;d')
VERSION_ESCAPED=$(echo $VERSION | sed -e 's:\.:-:g')

echo "Reading version from '$PACKAGE_JSON': $VERSION"
echo "Copying '$SOURCE' to '$TARGET' and replace {version} with $VERSION_ESCAPED"
sed "s/{version}/$VERSION_ESCAPED/" $SOURCE > $TARGET
