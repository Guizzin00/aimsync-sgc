#!/bin/bash
echo "Building project..."
python3 -m pip install -r requirements.txt
python3 backend/manage.py collectstatic --noinput
python3 backend/manage.py migrate
echo "Build completed!"
