#!/usr/bin/env bash
set -e

mode=$1

case "$mode" in
  prod)
    cd ../client
    npm run build
    cd ../server
    NODE_ENV=production npm start
    ;;
  dev)
    NODE_ENV=development npm run dev
    ;;
  *)
    echo "Usage: $0 {prod|dev}"
    exit 1
    ;;
esac
