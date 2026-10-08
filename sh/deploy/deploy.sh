#!/bin/bash
#description    :Script to deploy this project in LOCAL, QA and PROD environment
#author         :Flat 101 - Agustin RR
#usage          :bash deploy.sh -r REMOTE -b BRANCH -d DIRECTORY [ -o ]
#                  -o    Production-optimized deployments
#====================================================================================================

# --- constants ---
REMOTE=?
BRANCH=?
DIR=?
OPTIMIZED="false"

# --- colors ---
RED="\033[1;31m"
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NOCOLOR="\033[0m"

# --- banner ---
echo -e "${NOCOLOR}"
echo "  ____             _               _  ___  _ "
echo " |  _ \  ___ _ __ | | ___  _   _  / |/ _ \/ |"
echo " | | | |/ _ \ '_ \| |/ _ \| | | | | | | | | |"
echo " | |_| |  __/ |_) | | (_) | |_| | | | |_| | |"
echo " |____/ \___| .__/|_|\___/ \__, | |_|\___/|_|"
echo "            |_|            |___/             "
echo -e "                                    @Flat 101${NOCOLOR}\n"

# --- arguments ---
usage() {
	echo -e "[ ] Usage: $0 -r REMOTE -b BRANCH -d DIRECTORY [ -o ]"
	echo -e "[ ]    -o    Production-optimized deployments\n"
	exit 1
}

while getopts ':r:b:d:o' opt; do
	case "${opt}" in
	r) REMOTE=${OPTARG} ;;
	b) BRANCH=${OPTARG} ;;
	d) DIR=${OPTARG} ;;
	o) OPTIMIZED="true" ;;
	:) # Expected argument omitted
		echo -e "${RED}[-] Error: -${OPTARG} requires an argument.${NOCOLOR}"
		usage
		;;
	*) usage ;; # Unknown option
	esac
done

if [ $REMOTE = '?' ]; then echo -e "${RED}[-] Argument REMOTE is required.${NOCOLOR}"; fi
if [ $BRANCH = '?' ]; then echo -e "${RED}[-] Argument BRANCH is required.${NOCOLOR}"; fi
if [ $DIR = '?' ]; then echo -e "${RED}[-] Argument DIRECTORY is required.${NOCOLOR}"; fi

# If arguments are less than required: display usage and exit
if [ $REMOTE = '?' ] || [ $BRANCH = '?' ] || [ $DIR = '?' ]; then
	usage
fi

# --- functions ---
showResult() {
	local status=$1
	local label=$2

	case $status in
	255)
		echo -e "${BLUE}[-] ${label} not required${NOCOLOR}"
		;;
	0)
		echo -e "${GREEN}[+] ${label} succesfully !${NOCOLOR}"
		;;
	*)
		echo -e "${RED}[-] ${label} error${NOCOLOR}"
		;;
	esac
}

# --- main ---

# Go to project (git repository)
cd $DIR || exit 2

# git checkout...
echo -e "${BLUE}[+] git checkout ${BRANCH}${NOCOLOR}"
git checkout -q ${BRANCH}
if [ $? != 0 ]; then
	echo -e "${RED}[-] I can't deploy${NOCOLOR}"
	exit 3
fi

# git pull...
echo -e "${BLUE}[+] git pull ${REMOTE} ${BRANCH}${NOCOLOR}"

oldSha=$(git rev-parse HEAD)

pullOutput=$(git pull ${REMOTE} ${BRANCH} 2>&1)

if [ $? != 0 ]; then
	echo "${pullOutput}"
	echo -e "${RED}[-] I can't deploy${NOCOLOR}"
	exit 4
fi

echo "${pullOutput}"

if [[ "$pullOutput" == *"Already up to date."* ]] || [[ "$pullOutput" == *"Ya está actualizado."* ]]; then
	echo -e "${BLUE}[-] Deploy not required${NOCOLOR}"
	exit 0
fi

changedFilesOutput=$(git diff --name-only $oldSha 2>&1)

# Composer
composerStatus=255
if [[ "$changedFilesOutput" == *"composer.lock"* ]]; then
	echo -e "\n${BLUE}[+] Deploying Composer${NOCOLOR}"

	if [ $OPTIMIZED = 'true' ]; then
		composer install --no-dev -o
	else
		composer install
	fi

	composerStatus=$?
fi

# Cache
echo -e "\n${BLUE}[+] Flushing Cache${NOCOLOR}"
cd wordpress
wp cache flush
cacheStatus=$?

# Show results
echo ""
showResult 0 "Global deploy"
showResult $composerStatus "Composer deploy"
showResult $cacheStatus "Flush cache"
echo ""
