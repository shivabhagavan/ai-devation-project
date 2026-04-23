
# AI-Assisted Deviation Management – POC

## Overview
This project is a full-stack proof-of-concept for AI-assisted deviation management in a regulated (GxP) environment. It features:
- End-to-end deviation capture, investigation, and compliance memo generation
- AI-powered drafting and reasoning modules
- Human-in-the-loop review and sign-off
- Role-based workflow (Owner, QA, Approver)

---

## Features
- Deviation capture and workflow (Owner, QA, Approver roles)
- AI-assisted drafting of deviation memos and CAPA
- File upload/attachment support
- Role-based, persistent e-signature system
- Industrial-grade UI (React + MUI)
- FastAPI backend with SQLite database

---

## Quick Start (New Laptop)

### 1. Clone the Repository
```
git clone <repo-url>
cd ai_deviation_poc
```

### 2. Python Backend Setup
#### a. Install Python 3.10+ (if not already installed)
#### b. Create and activate a virtual environment:
```
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```
#### c. Install backend dependencies:
```
pip install -r requirements.txt
```
#### d. Start the backend server:
```
python -m uvicorn api.server:app --reload --port 8000
```
The backend will be available at http://localhost:8000

### 3. Frontend Setup (React UI)
#### a. Install Node.js (v18+ recommended) and npm if not already installed
#### b. Install frontend dependencies:
```
cd devmem-ui
npm install
```
#### c. Start the frontend server:
```
npm start
```
The frontend will be available at http://localhost:3000

---

## Usage
1. Open http://localhost:3000 in your browser.
2. Log in as Owner, QA, or Approver (role selection is available on the login page).
3. Create, review, and approve deviations through the workflow.
4. Use the sign-off chain to apply e-signatures (role-based access enforced).
5. All data is stored in a local SQLite database (`deviations.db`).

---

## Project Structure

- `api/` – FastAPI backend (main server, endpoints)
- `ai_modules/` – AI reasoning and drafting modules
- `database/` – SQLAlchemy models and DB logic
- `devmem-ui/` – React frontend (UI, pages, components)
- `documents/` – Example SOPs, regulations, and past cases
- `workflows/` – Deviation pipeline logic
- `chroma_db/` – Vector DB (for future RAG/LLM features)

---

## Environment Variables
You may create a `.env` file in the root for any API keys or environment overrides (not required for basic local use).

---

## Requirements
- Python 3.10+
- Node.js 18+
- npm 9+

---

## Troubleshooting
- If you see a port-in-use error, kill any existing Python/Node processes and restart.
- If you change the database schema, delete `deviations.db` to start fresh (existing data will be lost).
- For CORS errors, ensure both servers are running on localhost.

---

## Credits
Developed as a POC for AI-driven deviation management in regulated environments.
Mentor: [Your Mentor's Name]

---

## License
This project is for demonstration and educational purposes only.
