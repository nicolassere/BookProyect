@echo off
echo ============================================
echo  Book Reading Tracker - Backend
echo ============================================

REM Check if venv exists, create if not
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Start server
echo.
echo Starting server on http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo Press Ctrl+C to stop
echo.
uvicorn main:app --reload --port 8000
