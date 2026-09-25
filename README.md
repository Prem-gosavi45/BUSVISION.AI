# 🚌 BusVision AI — Urban Road Intelligence & Smart Mobility Platform

> **Smart India Hackathon (SIH) Project**

BusVision AI is an AI-powered urban intelligence platform that uses cameras mounted on public buses to continuously detect road infrastructure problems, analyse traffic conditions, geolocate incidents, store visual evidence, and present actionable information through a real-time dashboard.

---

## 1. Problem Statement

Urban road monitoring is often dependent on manual inspections, citizen complaints and periodic surveys. This can lead to delayed detection, incomplete location information, and limited visual evidence.

Common problems include:

- Potholes and damaged road surfaces
- Traffic congestion and high vehicle density
- Poorly documented incident locations
- Lack of structured visual evidence
- Fragmented analytics and reporting

### Objective

Use buses already travelling through cities as **mobile urban sensing platforms**, converting camera/video observations into structured, location-aware events.

---

## 2. Proposed Solution

### BusVision AI

The core pipeline is:

```text
Bus Camera / Video
        ↓
AI Detection + Tracking
        ↓
Event Generation
        ↓
GPS / Geolocation
        ↓
Evidence Image / Crop
        ↓
Supabase Database + Storage
        ↓
FastAPI REST API
        ↓
React/Vite Dashboard
        ↓
Alerts + Analytics + Reports
```

---

## 3. Key Features

### 🕳️ Pothole Detection

The AI pipeline detects potholes from bus-camera footage and stores structured event information such as:

- Pothole ID
- Bus ID
- Timestamp
- Confidence
- Size category
- Bounding-box dimensions
- Snapshot
- Crop
- Latitude / Longitude
- Location name
- Road
- Neighbourhood / suburb
- City
- State
- Postal code
- Event status

Example:

```json
{
  "event_type": "POTHOLE",
  "bus_id": "BUS_101",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "confidence": 0.85,
  "size_category": "MEDIUM",
  "status": "DETECTED"
}
```

### 🚦 Traffic Intelligence

The same event architecture supports traffic analysis:

- Vehicle count
- Average vehicle count
- Traffic level
- Timestamp
- Bus ID
- Location
- Evidence

Workflow:

```text
Video → Vehicle Detection → Tracking → Vehicle Count
      → Traffic Level → Location → Event → Database
```

### 📍 Location Intelligence

A detection becomes operationally useful when it contains geographic context.

The platform can associate coordinates with:

- Latitude
- Longitude
- Road
- Locality
- Suburb
- City
- State
- Postal code
- Human-readable location

Example:

```text
Latitude: 18.5204
Longitude: 73.8567
Road: Shivaji Road
Area: Kasba Peth
City: Pune
State: Maharashtra
PIN: 411001
```

### 📸 Evidence Management

Events can contain:

- Source-video snapshot
- Detection crop
- Public storage URL
- Event metadata

Example storage pattern:

```text
pothole-images/
└── BUS_101/
    ├── snapshots/
    └── crops/
```

### 🚨 Alerts

The dashboard can surface events such as:

- New pothole
- High-confidence detection
- Severe road condition
- High traffic
- Repeated issue
- Unresolved event

### 📊 Analytics

Analytics can be generated from stored event data:

- Total events
- Potholes
- Traffic events
- Events by day
- Events by location
- Events by bus
- Potholes by size
- Average confidence
- Traffic trends
- Resolved vs unresolved events

### 📄 Event Reports

An event report can contain:

```text
Event ID
Event Type
Bus ID
Date & Time
Latitude
Longitude
Road
Area
City
Confidence
Severity / Size
Status
Evidence Image
```

---

## 4. System Architecture

```text
                 ┌─────────────────────┐
                 │ BUS CAMERA / VIDEO  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ AI PROCESSING       │
                 │ YOLO + Tracking     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ EVENT GENERATOR     │
                 │ Pothole / Traffic   │
                 └──────────┬──────────┘
                            │
                       GPS + Evidence
                            │
                            ▼
                 ┌─────────────────────┐
                 │ SUPABASE            │
                 │ PostgreSQL + Storage│
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ FASTAPI             │
                 │ REST API            │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ REACT + VITE        │
                 │ WEB DASHBOARD       │
                 └──────────┬──────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
             Alerts     Analytics     Reports
```

---

## 5. Technology Stack

### Frontend

- React
- Vite
- JavaScript / TypeScript modules
- HTML
- CSS
- Dashboard components
- Charts
- REST API integration

### Backend

- Python
- FastAPI
- REST APIs
- Supabase integration
- Geocoding / reverse geocoding

### AI / Computer Vision

- YOLO
- Object detection
- Object tracking
- OpenCV
- Python
- Video processing

### Database / Storage

- Supabase
- PostgreSQL
- Supabase Storage

### Development

- Git
- GitHub
- Python virtual environment
- npm

---

## 6. Project Structure

```text
urban-intelligence/
│
├── ai/
│   ├── event_generator.py
│   ├── pothole_live.py
│   ├── tracker.py
│   └── video_processor.py
│
├── backend/
│   ├── main.py
│   ├── geocoding.py
│   ├── supabase_client.py
│   ├── supabase_events.py
│   ├── supabase_storage.py
│   └── routes/
│       ├── buses.py
│       ├── events.py
│       └── traffic.py
│
├── Frontend/
│   ├── package.json
│   └── src/
│
├── data/
│   ├── Pothole_Yolo8/
│   └── Video/
│
├── README.md
├── .gitignore
└── test_supabase.py
```

> Do not commit local virtual environments, `node_modules`, generated build output, secrets, or unnecessarily large datasets.

---

## 7. Requirements

Recommended:

- Windows / Linux / macOS
- Python 3.x
- Node.js
- npm
- Git
- Supabase project
- YOLO model / weights

---

## 8. Clone Repository

```bash
git clone https://github.com/Prem-gosavi45/BUSVISION.AI.git
cd BUSVISION.AI
```

---

## 9. Backend Setup

### Windows

```bat
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies if `backend/requirements.txt` exists:

```bash
pip install -r backend/requirements.txt
```

If it does not exist yet, install the project's required Python packages and create it with:

```bash
pip freeze > backend/requirements.txt
```

---

## 10. Environment Variables

Create `.env` in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Never commit real credentials.

---

## 11. Run Backend

From project root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 12. Run Frontend

Open a second terminal:

```bat
cd Frontend
npm install
npm run dev
```

Use the exact local URL printed by Vite, commonly:

```text
http://localhost:5173
```

---

## 13. Production Frontend Build

```bash
cd Frontend
npm install
npm run build
```

Build output:

```text
Frontend/dist/
```

Preview:

```bash
npm run preview
```

---

## 14. AI / Video Processing

Current AI modules include:

```text
ai/pothole_live.py
ai/video_processor.py
ai/tracker.py
ai/event_generator.py
```

Depending on the configured pipeline, an entry point can be run with:

```bash
python ai/pothole_live.py
```

or:

```bash
python ai/video_processor.py
```

Use the entry point configured for the selected dataset/video workflow.

---

## 15. API Examples

Get events:

```text
GET /api/events
```

Pothole events:

```text
GET /api/events?event_type=POTHOLE
```

Traffic events:

```text
GET /api/events?event_type=TRAFFIC
```

Always verify the currently available parameters in:

```text
http://127.0.0.1:8000/docs
```

---

## 16. Windows API Testing

`Invoke-RestMethod` is a PowerShell command. It does not work in normal Windows CMD.

### CMD

```bat
curl "http://127.0.0.1:8000/api/events?event_type=POTHOLE"
```

Save response:

```bat
curl "http://127.0.0.1:8000/api/events?event_type=POTHOLE" > events.json
```

### PowerShell

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/api/events?event_type=POTHOLE" | ConvertTo-Json -Depth 10
```

---

## 17. Pothole Event Data Flow

```text
Bus Camera
    ↓
Video Frame
    ↓
YOLO Detection
    ↓
Object Tracking
    ↓
Confidence + Dimensions
    ↓
Event Generation
    ↓
Snapshot + Crop
    ↓
GPS Coordinates
    ↓
Reverse Geocoding
    ↓
Supabase
    ↓
FastAPI
    ↓
Dashboard
    ↓
Analytics / Alerts / Reports
```

---

## 18. Example Event

```json
{
  "id": 8,
  "event_type": "POTHOLE",
  "bus_id": "BUS_101",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timestamp": "2026-09-22T15:23:01Z",
  "confidence": 0.85,
  "pothole_id": 999,
  "size_category": "MEDIUM",
  "width_px": 150,
  "height_px": 80,
  "area_px": 12000,
  "area_percent": 1.2,
  "status": "DETECTED",
  "location_name": "Kasba Peth, Pune",
  "road_name": "Shivaji Road",
  "city": "Pune",
  "state": "Maharashtra",
  "postcode": "411001"
}
```

---

## 19. Git Workflow

Check:

```bash
git status
```

Stage:

```bash
git add .
```

Commit:

```bash
git commit -m "Update BusVision AI"
```

Push:

```bash
git push origin main
```

### Important

Keep these out of Git:

```text
.env
venv/
__pycache__/
*.pyc
node_modules/
Frontend/node_modules/
Frontend/dist/
runs/
```

Large files such as videos and model weights can exceed GitHub's normal limits. Use Git LFS or external object storage if they need versioning.

---

## 20. Netlify + Backend Deployment

The frontend and backend should be deployed separately.

```text
                   INTERNET
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          Netlify             Backend Host
        React / Vite             FastAPI
             │                   │
             └─────────┬─────────┘
                       ▼
                    Supabase
              PostgreSQL + Storage
```

### Frontend

Netlify hosts the React/Vite frontend.

### Backend

Deploy FastAPI to a backend-capable hosting provider.

### Database

Supabase stores persistent event data and evidence.

### Production API

The frontend must use the deployed backend URL instead of:

```text
http://localhost:8000
```

Store the production API URL as a frontend environment variable.

---

## 21. Scalability

The architecture can scale from one bus to a fleet:

```text
BUS_101 ─┐
BUS_102 ─┤
BUS_103 ─┤
BUS_104 ─┼──► Central Event Platform
BUS_105 ─┤
BUS_106 ─┘
```

Each bus can contribute:

- Video observations
- GPS information
- Traffic measurements
- Road-condition events
- Evidence images

---

## 22. Future Scope

Potential extensions:

- Live bus GPS
- Real-time camera streams
- Multi-camera fusion
- Duplicate-event clustering
- Road-segment health scores
- Historical pothole recurrence
- Automatic authority assignment
- Event priority calculation
- Citizen reporting
- Mobile application
- Municipal command-centre integration
- Traffic forecasting
- Heatmaps
- Route-level road quality analytics
- Automated PDF/CSV reports
- Role-based access
- Multi-city deployment
- Edge AI inference on buses

---

## 23. Security

Never commit:

```text
.env
venv/
node_modules/
Frontend/dist/
__pycache__/
*.pyc
```

Never commit:

- Supabase secret keys
- API keys
- Passwords
- Private credentials

Use environment variables provided by the deployment platform for production secrets.

---

## 24. SIH Demonstration Flow

### 1. Dashboard

Show:

- Total events
- Potholes
- Traffic
- Alerts
- Recent events

### 2. AI Detection

Play a sample bus video and show the detection pipeline.

### 3. Event Details

Show:

- Event type
- Confidence
- Bus ID
- Timestamp
- Evidence image

### 4. Exact Location

Show:

- Latitude
- Longitude
- Road
- Area
- City

### 5. Analytics

Show event trends generated from stored event data.

### 6. Alerts

Show newly detected events requiring attention.

### 7. Report

Generate an event report containing evidence and location information.

---

## 25. Impact

BusVision AI is designed to provide cities with a scalable mechanism for:

- Continuous road-condition observation
- Faster incident identification
- Evidence-backed reporting
- Location-aware event management
- Data-driven traffic analysis
- Centralized urban intelligence

### Core Idea

> **Use buses that already move through the city as mobile sensing platforms.**

---

## 26. Vision

```text
Traditional:

Road
  ↓
Problem
  ↓
Complaint
  ↓
Manual Inspection


BusVision:

Road
  ↓
Bus Camera
  ↓
AI
  ↓
Location
  ↓
Evidence
  ↓
Event
  ↓
Insight
  ↓
Action
```

---

## 27. Repository

**GitHub:** https://github.com/Prem-gosavi45/BUSVISION.AI.git

**Project:** BusVision AI  
**Purpose:** AI-assisted urban road and traffic intelligence  
**Event Types:** Pothole, Traffic and extensible future event categories  
**Built For:** Smart India Hackathon (SIH)

---

## 28. License

Add the project's intended open-source or institutional license before public production release.

---

## 29. Acknowledgement

BusVision AI combines computer vision, object tracking, geospatial intelligence, cloud data storage, REST APIs, web technologies and analytics to explore practical AI-assisted urban infrastructure monitoring.
