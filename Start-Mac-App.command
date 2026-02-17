#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Checking dependencies..."

# Check and install backend dependencies
if [ ! -d "$DIR/server/node_modules" ]; then
    echo "Installing Backend dependencies..."
    cd "$DIR/server" && npm install
fi

# Check and install frontend dependencies
if [ ! -d "$DIR/client/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd "$DIR/client" && npm install
fi

# Open Backend in a new terminal tab/window
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/server' && node index.js\""

# Open Frontend in a new terminal tab/window (this will also open the browser)
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/client' && npm run dev\""
