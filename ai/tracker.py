import os
import sys
import json
import cv2
import urllib.request
from collections import deque
from ultralytics import YOLO


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)


from ai.event_generator import create_traffic_event


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "ai/models/yolo26s.pt"

VIDEO_PATH = "data/video/bus_test.mp4"

OUTPUT_PATH = "data/video/tracking_output.mp4"

EVENT_API_URL = (
    "http://127.0.0.1:8000/api/events"
)

GPS_API_URL = (
    "http://127.0.0.1:8000/gps/BUS_101"
)

BUS_ID = "BUS_101"


# ============================================================
# VEHICLE CLASSES
# ============================================================

VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}


# ============================================================
# TRACKING SETTINGS
# ============================================================

# Track must appear for at least this many frames
# before being considered a stable tracking ID.
MIN_TRACK_FRAMES = 3

# Horizontal line used for vehicle counting.
# Video resolution is 1280x720, so 400 is an initial value.
LINE_Y = 400


# ============================================================
# GPS
# ============================================================

def get_latest_gps():

    try:

        with urllib.request.urlopen(
            GPS_API_URL,
            timeout=2
        ) as response:

            data = json.loads(
                response.read().decode("utf-8")
            )

        if data.get("status") != "OK":
            return None, None

        gps_data = data.get(
            "data",
            {}
        )

        latitude = gps_data.get(
            "latitude"
        )

        longitude = gps_data.get(
            "longitude"
        )

        return latitude, longitude

    except Exception:

        return None, None


# ============================================================
# SEND EVENT TO FASTAPI
# ============================================================

def send_event_to_api(event):

    try:

        payload = json.dumps(
            event
        ).encode("utf-8")

        request = urllib.request.Request(
            EVENT_API_URL,
            data=payload,
            headers={
                "Content-Type": "application/json"
            },
            method="POST"
        )

        with urllib.request.urlopen(
            request,
            timeout=5
        ) as response:

            response_data = json.loads(
                response.read().decode("utf-8")
            )

        return response_data

    except Exception as error:

        print(
            "EVENT API ERROR:",
            error
        )

        return None


# ============================================================
# MAIN TRACKING
# ============================================================

def run_tracking():

    print(
        "Loading YOLO26s..."
    )

    model = YOLO(
        MODEL_PATH
    )

    print(
        "Opening video..."
    )

    cap = cv2.VideoCapture(
        VIDEO_PATH
    )

    if not cap.isOpened():

        raise RuntimeError(
            f"Could not open video: {VIDEO_PATH}"
        )

    # ========================================================
    # VIDEO INFORMATION
    # ========================================================

    width = int(
        cap.get(
            cv2.CAP_PROP_FRAME_WIDTH
        )
    )

    height = int(
        cap.get(
            cv2.CAP_PROP_FRAME_HEIGHT
        )
    )

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    print(
        f"Resolution: {width}x{height}"
    )

    print(
        f"Video FPS: {fps}"
    )

    print(
        f"Total frames: {total_frames}"
    )

    # ========================================================
    # OUTPUT VIDEO
    # ========================================================

    fourcc = cv2.VideoWriter_fourcc(
        *"mp4v"
    )

    writer = cv2.VideoWriter(
        OUTPUT_PATH,
        fourcc,
        fps,
        (width, height)
    )

    if not writer.isOpened():

        cap.release()

        raise RuntimeError(
            f"Could not create output video: "
            f"{OUTPUT_PATH}"
        )

    # ========================================================
    # TRACKING VARIABLES
    # ========================================================

    frame_count = 0

    # Stable ByteTrack IDs
    unique_vehicle_ids = set()

    # Number of frames each track ID has appeared
    track_frames = {}

    # Current frame vehicle IDs
    current_vehicle_ids = set()

    # ========================================================
    # LINE CROSSING VARIABLES
    # ========================================================

    # Track IDs that already crossed the counting line
    counted_track_ids = set()

    # Previous Y position of each tracked vehicle
    previous_centers = {}

    # Passed vehicle count by class
    passed_counts = {
        "car": 0,
        "motorcycle": 0,
        "bus": 0,
        "truck": 0
    }

    # ========================================================
    # 5 SECOND TRAFFIC HISTORY
    # ========================================================

    history_size = max(
        int(fps * 5),
        1
    )

    vehicle_history = deque(
        maxlen=history_size
    )

    # ========================================================
    # START
    # ========================================================

    print()

    print(
        "Starting YOLO + ByteTrack..."
    )

    print(
        "Live GPS source:",
        GPS_API_URL
    )

    print(
        "Event API:",
        EVENT_API_URL
    )

    print(
        "Counting line Y:",
        LINE_Y
    )

    print()

    # ========================================================
    # PROCESS VIDEO
    # ========================================================

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        # ====================================================
        # YOLO + BYTETRACK
        # ====================================================

        results = model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=list(
                VEHICLE_CLASSES.keys()
            ),
            verbose=False
        )

        result = results[0]

        annotated_frame = result.plot()

        # ====================================================
        # RESET CURRENT FRAME DATA
        # ====================================================

        current_vehicle_ids = set()

        vehicle_counts = {
            "car": 0,
            "motorcycle": 0,
            "bus": 0,
            "truck": 0
        }

        # ====================================================
        # PROCESS DETECTIONS
        # ====================================================

        if result.boxes is not None:

            for box in result.boxes:

                if box.cls is None:
                    continue

                class_id = int(
                    box.cls[0].item()
                )

                if class_id not in VEHICLE_CLASSES:
                    continue

                vehicle_type = (
                    VEHICLE_CLASSES[
                        class_id
                    ]
                )

                # --------------------------------------------
                # CURRENT VEHICLE CLASS COUNT
                # --------------------------------------------

                vehicle_counts[
                    vehicle_type
                ] += 1

                # --------------------------------------------
                # BYTE TRACK ID
                # --------------------------------------------

                if box.id is None:
                    continue

                track_id = int(
                    box.id[0].item()
                )

                current_vehicle_ids.add(
                    track_id
                )

                # --------------------------------------------
                # TRACK LIFETIME
                # --------------------------------------------

                if track_id not in track_frames:

                    track_frames[
                        track_id
                    ] = 0

                track_frames[
                    track_id
                ] += 1

                # --------------------------------------------
                # STABLE UNIQUE TRACK
                # --------------------------------------------

                if (
                    track_frames[track_id]
                    >= MIN_TRACK_FRAMES
                ):

                    unique_vehicle_ids.add(
                        track_id
                    )

                # --------------------------------------------
                # BOUNDING BOX CENTER
                # --------------------------------------------

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist()
                )

                center_x = (
                    x1 + x2
                ) // 2

                center_y = (
                    y1 + y2
                ) // 2

                # --------------------------------------------
                # LINE CROSSING
                # --------------------------------------------

                if track_id in previous_centers:

                    previous_y = (
                        previous_centers[
                            track_id
                        ]
                    )

                    # Vehicle moving downward
                    crossed_down = (
                        previous_y < LINE_Y
                        and center_y >= LINE_Y
                    )

                    # Vehicle moving upward
                    crossed_up = (
                        previous_y > LINE_Y
                        and center_y <= LINE_Y
                    )

                    if (
                        (
                            crossed_down
                            or crossed_up
                        )
                        and track_id
                        not in counted_track_ids
                    ):

                        counted_track_ids.add(
                            track_id
                        )

                        passed_counts[
                            vehicle_type
                        ] += 1

                # Save current center
                previous_centers[
                    track_id
                ] = center_y

        # ====================================================
        # CURRENT VEHICLE COUNT
        # ====================================================

        current_vehicle_count = len(
            current_vehicle_ids
        )

        # ====================================================
        # 5 SECOND AVERAGE
        # ====================================================

        vehicle_history.append(
            current_vehicle_count
        )

        average_vehicle_count = (
            sum(vehicle_history)
            / len(vehicle_history)
        )

        # ====================================================
        # TRAFFIC LEVEL
        # ====================================================

        if average_vehicle_count <= 10:

            traffic_level = "LOW"

        elif average_vehicle_count <= 20:

            traffic_level = "MEDIUM"

        else:

            traffic_level = "HIGH"

        # ====================================================
        # GPS
        # ====================================================

        latitude, longitude = (
            get_latest_gps()
        )

        # ====================================================
        # TRAFFIC EVENT
        # ====================================================

        traffic_event = create_traffic_event(
            bus_id=BUS_ID,
            vehicle_count=current_vehicle_count,
            average_vehicle_count=average_vehicle_count,
            traffic_level=traffic_level,
            latitude=latitude,
            longitude=longitude
        )

        # ====================================================
        # COUNTERS
        # ====================================================

        total_unique_vehicles = len(
            unique_vehicle_ids
        )

        total_passed = sum(
            passed_counts.values()
        )

        # ====================================================
        # VEHICLE BREAKDOWN
        # ====================================================

        breakdown = (
            f"CAR:{vehicle_counts['car']} "
            f"BIKE:{vehicle_counts['motorcycle']} "
            f"BUS:{vehicle_counts['bus']} "
            f"TRUCK:{vehicle_counts['truck']}"
        )

        # ====================================================
        # DISPLAY CURRENT VEHICLES
        # ====================================================

        cv2.putText(
            annotated_frame,
            f"Vehicles: {current_vehicle_count}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        # ====================================================
        # DISPLAY 5 SECOND AVERAGE
        # ====================================================

        cv2.putText(
            annotated_frame,
            f"5s Avg: {average_vehicle_count:.1f}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        # ====================================================
        # DISPLAY UNIQUE TRACK IDs
        # ====================================================

        cv2.putText(
            annotated_frame,
            f"Unique IDs: {total_unique_vehicles}",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 255, 0),
            2
        )

        # ====================================================
        # DISPLAY CURRENT BREAKDOWN
        # ====================================================

        cv2.putText(
            annotated_frame,
            breakdown,
            (20, 160),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )

        # ====================================================
        # DISPLAY TRAFFIC LEVEL
        # ====================================================

        cv2.putText(
            annotated_frame,
            f"Traffic: {traffic_level}",
            (20, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

        # ====================================================
        # DISPLAY GPS
        # ====================================================

        if (
            latitude is not None
            and longitude is not None
        ):

            gps_text = (
                f"GPS: {latitude:.5f}, "
                f"{longitude:.5f}"
            )

        else:

            gps_text = (
                "GPS: Waiting..."
            )

        cv2.putText(
            annotated_frame,
            gps_text,
            (20, 240),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 0),
            2
        )

        # ====================================================
        # DISPLAY PASSED VEHICLES
        # ====================================================

        passed_text = (
            f"Passed: {total_passed} "
            f"CAR:{passed_counts['car']} "
            f"BIKE:{passed_counts['motorcycle']} "
            f"BUS:{passed_counts['bus']} "
            f"TRUCK:{passed_counts['truck']}"
        )

        cv2.putText(
            annotated_frame,
            passed_text,
            (20, 280),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (0, 255, 255),
            2
        )

        # ====================================================
        # DRAW COUNTING LINE
        # ====================================================

        cv2.line(
            annotated_frame,
            (0, LINE_Y),
            (width, LINE_Y),
            (0, 0, 255),
            3
        )

        cv2.putText(
            annotated_frame,
            "COUNTING LINE",
            (20, LINE_Y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

        # ====================================================
        # WRITE FRAME
        # ====================================================

        writer.write(
            annotated_frame
        )

        # ====================================================
        # SEND EVENT EVERY 20 FRAMES
        # ====================================================

        if frame_count % 20 == 0:

            api_response = (
                send_event_to_api(
                    traffic_event
                )
            )

            print(
                f"Frame "
                f"{frame_count}/"
                f"{total_frames}"
            )

            print(
                "TRAFFIC EVENT:"
            )

            print(
                traffic_event
            )

            print(
                f"Current vehicles: "
                f"{current_vehicle_count}"
            )

            print(
                f"5s average: "
                f"{average_vehicle_count:.1f}"
            )

            print(
                f"Unique tracking IDs: "
                f"{total_unique_vehicles}"
            )

            print(
                f"Vehicles passed: "
                f"{total_passed}"
            )

            print(
                "Passed breakdown:",
                passed_counts
            )

            if latitude is not None:

                print(
                    f"GPS ATTACHED: "
                    f"{latitude}, "
                    f"{longitude}"
                )

            else:

                print(
                    "GPS ATTACHED: None"
                )

            if api_response is not None:

                print(
                    "EVENT SENT TO FASTAPI"
                )

                print(
                    "API RESPONSE:",
                    api_response
                )

            else:

                print(
                    "EVENT NOT SENT TO FASTAPI"
                )

            print()

        # ====================================================
        # DISPLAY VIDEO
        # ====================================================

        cv2.imshow(
            "YOLO26s + ByteTrack - BusVision",
            annotated_frame
        )

        if (
            cv2.waitKey(1) & 0xFF
            == ord("q")
        ):

            print(
                "Stopped by user."
            )

            break

    # ========================================================
    # CLEANUP
    # ========================================================

    cap.release()

    writer.release()

    cv2.destroyAllWindows()

    # ========================================================
    # FINAL RESULTS
    # ========================================================

    print()

    print(
        "Tracking completed."
    )

    print(
        f"Processed frames: "
        f"{frame_count}"
    )

    print(
        f"Unique tracking IDs: "
        f"{len(unique_vehicle_ids)}"
    )

    print(
        f"Vehicles passed: "
        f"{sum(passed_counts.values())}"
    )

    print(
        "Passed vehicle breakdown:"
    )

    print(
        passed_counts
    )

    print(
        f"Output saved to: "
        f"{OUTPUT_PATH}"
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    run_tracking()