#!/bin/bash
#description    :Script to create or update WordPress
#author         :Flat 101 - Agustin RR
#usage          :bash wp-prepare.sh
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

# Create or update WordPress
if [ -e "$WP_DIR/wp-includes/version.php" ]; then
  # If WordPress has a different version then update core
  CURRENT_VERSION=$(php wp-cli.phar core version --path=$WP_DIR)
  if [ "$VERSION" == "$CURRENT_VERSION" ]; then
    echo -e "${BLUE}WordPress ${VERSION} already installed${NOCOLOR}"
  else
    echo -e "${BLUE}Updating WordPress ${VERSION}...${NOCOLOR}"
    php wp-cli.phar core update --path=$WP_DIR --locale=$LOCALE --version=$VERSION --force
    php wp-cli.phar core update-db --path=$WP_DIR
  fi
else
  echo -e "${BLUE}Installing WordPress ${VERSION}...${NOCOLOR}"
  php wp-cli.phar core download --path=$WP_DIR --locale=$LOCALE --version=$VERSION --skip-content
  php wp-cli.phar config create --path=$WP_DIR --skip-check --dbhost=$DB_HOST --dbname=$DB_DATABASE --dbuser=$DB_USER --dbpass=$DB_PASSWORD --dbcharset=$DB_CHARSET --dbcollate=$DB_COLLATE --dbprefix=$DB_PREFIX --extra-php <$SCRIPTPATH/.wp-config.extra.php.txt
  php wp-cli.phar config set WP_SITEURL "https://${DOMAIN}" --path=$WP_DIR
  php wp-cli.phar config set WP_HOME "https://${DOMAIN}" --path=$WP_DIR
  php wp-cli.phar config set WP_ENVIRONMENT_TYPE "${ENVIRONMENT}" --path=$WP_DIR

  chmod 600 $WP_DIR/wp-config.php

  # Create the database if we are not in a container
  if [ ! -e "/.dockerenv" ]; then
    php wp-cli.phar db create --path=$WP_DIR || true
  fi

  mkdir -p $WP_DIR/wp-content/mu-plugins
  mkdir -p $WP_DIR/wp-content/uploads/$(date +'%Y')/$(date +'%m')

  php wp-cli.phar core install --path=$WP_DIR --url="https://${DOMAIN}" --title="$TITLE" --admin_user=$ADMIN_NAME --admin_password=$ADMIN_PASSWORD --admin_email=$ADMIN_EMAIL --locale=$LOCALE --skip-email
  php wp-cli.phar user update $ADMIN_NAME --path=$WP_DIR --nickname="$ADMIN_NICKNAME" --display_name="$ADMIN_NICKNAME" --skip-email

  # Post installation configuration
  php wp-cli.phar rewrite structure '/%postname%/' --path=$WP_DIR

  echo -e "<?php\nrequire __DIR__ . '/flat101-base/flat101-base.php';" >$WP_DIR/wp-content/mu-plugins/flat101-base.php
fi
