#!/bin/bash
trap 'yarn pm2 kill; exit' SIGINT
yarn pm2 start ecosystem.config.js --attach
wait
