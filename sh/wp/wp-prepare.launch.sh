#!/bin/bash
#title          :wp-prepare.launch.sh
#description    :Script to create or update WordPress. Launch the request to the correct environment.
#author         :Agustin RR
#usage          :bash wp-prepare.launch.sh
#====================================================================================================

set -e

# It doesn't matter where this script is launched from
SCRIPTPATH="$(
    cd -- "$(dirname "$0")" >/dev/null 2>&1
    pwd -P
)"
cd $SCRIPTPATH

# --- colors ---
RED="\033[1;31m"
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NOCOLOR="\033[0m"

# Check requirements
if [ ! -e .wp.env ]; then
    echo -e "${RED}Before running this script copy ".wp-sample.env" to ".wp.env" and update its content.${NOCOLOR}"
    exit 1
fi

# Load environment variables
source '.wp.env'

# If '.wp.local.env' exists, it takes precedence
[ -r '.wp.local.env' ] && source '.wp.local.env'

# --- main ---

# If $ENGINE environment variable is set to 'docker'
if [ "$ENGINE" = 'docker' ]; then

    # We are out of the container
    if [ -r '../../docker/.env' ]; then
        source '../../docker/.env'
        docker exec -u www-data ${COMPOSE_PROJECT_NAME}-wordpress sh/wp/wp-prepare.sh

    # We are inside the container
    else
        bash wp-prepare.sh
    fi

# We don't use docker
else
    bash wp-prepare.sh
fi
