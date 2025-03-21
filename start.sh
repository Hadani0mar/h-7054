
#!/bin/bash
# Simple script to start the Flask server on Termux

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed. Please install it using:"
    echo "pkg install python"
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "Pip is not installed. Please install it using:"
    echo "pkg install python-pip"
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "Starting server on port 5000..."
python3 server.py
