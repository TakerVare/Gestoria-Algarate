#!/bin/bash
#title          :install.sh
#description    :Script to install the project
#author         :Agustin RR
#usage          :bash install.sh
#====================================================================================================

set -e

# It doesn't matter where this script is launched from
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

# --- colors ---
RED="\033[1;31m"
NOCOLOR="\033[0m"

# Check requirements
if [ ! -e '.env' ]; then
    echo -e "${RED}Before running this script copy ".env.example" to ".env" and update its content.${NOCOLOR}"
    exit 1
fi

# --- main ---
source '.env'

# Create web directory
mkdir -p $PROJECT_PATH/$WEB_DIR

# Create log files
mkdir -p logs
touch -a logs/access.log
touch -a logs/error.log
touch -a logs/cron.log

# Create database directory
mkdir -p db/data
mkdir -p db/init-db

# Create cert
DOMAIN=$(echo "$DOMAIN")
mkdir -p nginx/ssl && cd "$_"
mkcert -install "${DOMAIN}" 2>&1
