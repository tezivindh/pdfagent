#!/bin/bash
source venv/bin/activate
echo "Starting backend..."
uvicorn app.main:app --reload --port 8000
