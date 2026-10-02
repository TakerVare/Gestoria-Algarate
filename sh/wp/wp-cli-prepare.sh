#!/bin/bash
#description    :Script to create or update WordPress
#author         :Flat 101 - Agustin RR
#usage          :bash wp-prepare.sh
#====================================================================================================

set -e

# It doesn't matter where this script is launched from
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

# --- colors ---
RED="\033[1;31m"
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NOCOLOR="\033[0m"

# --- main ---

# Create or update WP-CLI
if [ -e 'wp-cli.phar' ]; then
    php wp-cli.phar cli update --yes
else
    echo -e "${BLUE}Installing WP-CLI...${NOCOLOR}"

    if [ -x "$(command -v wget)" ]; then
        wget https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    elif [ -x "$(command -v curl)" ]; then
        curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    fi

    if [ -r 'wp-cli.phar' ]; then
        echo -e "${GREEN}[+] $(php wp-cli.phar --version)${NOCOLOR}"
    else
        echo -e "${RED}[-] I can't install WP-CLI${NOCOLOR}"
        exit 2
    fi
fi