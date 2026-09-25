🚀 BusVision AI — Complete Run Sequence
Step 0 — Project folder

CMD kholo:

cd D:\urban-intelligence\urban-intelligence
Step 1 — Virtual environment activate
venv\Scripts\activate

Prompt me ye aana chahiye:

(venv) D:\urban-intelligence\urban-intelligence>
Step 2 — Terminal 1: FastAPI start

Terminal 1 me:

cd D:\urban-intelligence\urban-intelligence
venv\Scripts\activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000

Expected:

Uvicorn running on http://0.0.0.0:8000

🛑 Is terminal ko band nahi karna.

Step 3 — Terminal 2: ngrok start

New CMD/Terminal kholo:

cd D:\urban-intelligence\urban-intelligence
ngrok http 8000

Expected:

Forwarding    https://xxxxxxxx.ngrok-free.dev

Jo https://...ngrok-free.dev URL milega, usko copy karo.

🛑 ngrok terminal bhi running rehna chahiye.

Token dobara configure karne ki zarurat nahi hai, agar ngrok config check already valid hai.

Step 4 — Phone GPS start

Phone Chrome me:

https://YOUR-NGROK-URL/gps-page

Example:

https://xxxxx.ngrok-free.dev/gps-page

Location permission aaye:

Allow Location 📍

Screen par ye dikhna chahiye:

GPS active - sending location...

Latitude: 18.xxxxxx
Longitude: 73.xxxxxx
Accuracy: x.x meters

🛑 Phone ka GPS page open rehne do.

Step 5 — Terminal 3: AI tracker start

New CMD/Terminal kholo:

cd D:\urban-intelligence\urban-intelligence
venv\Scripts\activate

Phir:

python ai\tracker.py

Ab:

YOLO26s
   ↓
ByteTrack
   ↓
Vehicle Count
   ↓
Traffic Level
   ↓
Phone GPS
   ↓
Traffic Event

Video window open hogi.

Usme roughly:

Vehicles: 24
5s Avg: 22.8
Unique: 75
Traffic: HIGH
GPS: 18.xxxxx, 73.xxxxx

aisa dikhna chahiye.

Step 6 — Event verify

Tracker complete hone ke baad Terminal 3 me:

type data\events\traffic_events.jsonl

Latest event me:

"latitude": 18.xxxxxx,
"longitude": 73.xxxxxx

hona chahiye.

🧩 Yaad rakhne wala shortcut

Har demo me bas:

TERMINAL 1
FastAPI
   ↓
TERMINAL 2
ngrok
   ↓
PHONE
GPS
   ↓
TERMINAL 3
tracker.py
Commands only

Terminal 1

cd D:\urban-intelligence\urban-intelligence
venv\Scripts\activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000

Terminal 2

cd D:\urban-intelligence\urban-intelligence
ngrok http 8000

Phone

https://YOUR-NGROK-URL/gps-page

Terminal 3

cd D:\urban-intelligence\urban-intelligence
venv\Scripts\activate
python ai\tracker.py

Verify

type data\events\traffic_events.jsonl
⚠️ Important

python ai\detect.py aur python backend\main.py normal demo startup ke liye ab zaroori nahi hain. Current working demo ke liye FastAPI + ngrok + phone GPS + tracker enough hai.