import cv2
import os
import requests
from datetime import datetime

from ultralytics import YOLO

from ai.event_generator import create_pothole_event
from backend.supabase_storage import upload_image, get_public_url


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "ai/models/pothole_best.pt"

VIDEO_PATH = (
    "data/Pothole_Yolo8/sample_video.mp4"
)

OUTPUT_VIDEO = (
    "runs/pothole_live/pothole_tracking.mp4"
)

SNAPSHOT_DIR = (
    "runs/pothole_live/snapshots"
)

CROP_DIR = (
    "runs/pothole_live/pothole_crops"
)

CONFIDENCE = 0.15

BUS_ID = "BUS_101"

GPS_API_URL = (
    "http://127.0.0.1:8000/gps/BUS_101"
)

EVENT_API_URL = (
    "http://127.0.0.1:8000/api/events"
)

IMAGE_SIZE = 1280

UPSCALE = 2.0

WINDOW_NAME = (
    "BusVision - Live Pothole Detection"
)


# ============================================================
# CREATE DIRECTORIES
# ============================================================

os.makedirs(
    "runs/pothole_live",
    exist_ok=True
)

os.makedirs(
    SNAPSHOT_DIR,
    exist_ok=True
)

os.makedirs(
    CROP_DIR,
    exist_ok=True
)


# ============================================================
# POTHOLE SIZE CLASSIFICATION
# ============================================================

def classify_pothole_size(area_percent):

    if area_percent < 0.5:
        return "SMALL"

    elif area_percent < 2.0:
        return "MEDIUM"

    else:
        return "LARGE"


# ============================================================
# GET CURRENT GPS
# ============================================================

def get_current_gps():

    for attempt in range(5):

        try:

            response = requests.get(
                GPS_API_URL,
                timeout=3
            )

            if response.status_code == 200:

                gps_data = response.json()

                data = gps_data.get(
                    "data",
                    gps_data
                )

                latitude = data.get(
                    "latitude"
                )

                longitude = data.get(
                    "longitude"
                )

                if (
                    latitude is not None
                    and longitude is not None
                ):

                    print(
                        f"[GPS] Latitude={latitude}, "
                        f"Longitude={longitude}"
                    )

                    return latitude, longitude

                print(
                    f"[GPS] No coordinates yet "
                    f"(attempt {attempt + 1}/5)"
                )

            else:

                print(
                    f"[GPS ERROR] "
                    f"Status={response.status_code}"
                )

        except requests.exceptions.RequestException as error:

            print(
                f"[GPS ERROR] Attempt "
                f"{attempt + 1}/5: {error}"
            )

        # Small delay before retry
        import time
        time.sleep(0.5)

    print(
        "[GPS ERROR] Could not obtain valid GPS coordinates"
    )

    return None, None


# ============================================================
# SEND POTHOLE EVENT TO FASTAPI
# ============================================================

def send_pothole_event(event):

    try:

        response = requests.post(
            EVENT_API_URL,
            json=event,
            timeout=3
        )

        if response.status_code == 200:

            print(
                "[API] POTHOLE EVENT SENT"
            )

            try:

                print(
                    response.json()
                )

            except ValueError:

                print(
                    response.text
                )

        else:

            print(
                f"[API ERROR] "
                f"Status={response.status_code}"
            )

            print(
                response.text
            )

    except requests.exceptions.RequestException as error:

        print(
            "[API ERROR] "
            f"Could not connect to FastAPI: "
            f"{error}"
        )


# ============================================================
# UPLOAD IMAGE TO SUPABASE STORAGE
# ============================================================

def upload_pothole_image(
    local_path,
    storage_path,
    image_type
):

    try:

        upload_image(
            local_path,
            storage_path
        )

        public_url = get_public_url(
            storage_path
        )

        print(
            f"[STORAGE] {image_type} uploaded:"
        )

        print(
            public_url
        )

        return public_url

    except Exception as error:

        print(
            f"[STORAGE ERROR] "
            f"Could not upload {image_type}: "
            f"{error}"
        )

        return None


# ============================================================
# LOAD MODEL
# ============================================================

print()

print(
    "========================================"
)

print(
    "Loading pothole model..."
)

print(
    "========================================"
)

model = YOLO(
    MODEL_PATH
)

print(
    "Model loaded successfully."
)

print(
    f"Confidence threshold: {CONFIDENCE}"
)

print(
    f"Inference size: {IMAGE_SIZE}"
)

print(
    f"Upscale: {UPSCALE}x"
)


# ============================================================
# OPEN VIDEO
# ============================================================

print()

print(
    "Opening video..."
)

cap = cv2.VideoCapture(
    VIDEO_PATH
)

if not cap.isOpened():

    raise RuntimeError(
        f"Could not open video: "
        f"{VIDEO_PATH}"
    )


# ============================================================
# VIDEO INFORMATION
# ============================================================

fps = cap.get(
    cv2.CAP_PROP_FPS
)

if fps <= 0:

    fps = 30.0


original_width = int(
    cap.get(
        cv2.CAP_PROP_FRAME_WIDTH
    )
)

original_height = int(
    cap.get(
        cv2.CAP_PROP_FRAME_HEIGHT
    )
)

total_frames = int(
    cap.get(
        cv2.CAP_PROP_FRAME_COUNT
    )
)


print(
    f"Original video: "
    f"{original_width}x{original_height}"
)

print(
    f"FPS: {fps}"
)

print(
    f"Total frames: {total_frames}"
)


# ============================================================
# OUTPUT VIDEO
# ============================================================

fourcc = cv2.VideoWriter_fourcc(
    *"mp4v"
)

writer = cv2.VideoWriter(
    OUTPUT_VIDEO,
    fourcc,
    fps,
    (
        original_width,
        original_height
    )
)

if not writer.isOpened():

    cap.release()

    raise RuntimeError(
        f"Could not create output video: "
        f"{OUTPUT_VIDEO}"
    )


# ============================================================
# TRACKING STATE
# ============================================================

seen_pothole_ids = set()

total_unique_potholes = 0

frame_number = 0


# ============================================================
# START PROCESSING
# ============================================================

print()

print(
    "========================================"
)

print(
    "Starting pothole detection..."
)

print(
    "========================================"
)

print()


# ============================================================
# MAIN VIDEO LOOP
# ============================================================

while True:

    # --------------------------------------------------------
    # READ FRAME
    # --------------------------------------------------------

    ret, frame = cap.read()

    if not ret:

        print(
            "Video finished."
        )

        break

    frame_number += 1


    # --------------------------------------------------------
    # UPSCALE FRAME FOR INFERENCE
    # --------------------------------------------------------

    if UPSCALE != 1.0:

        inference_frame = cv2.resize(
            frame,
            None,
            fx=UPSCALE,
            fy=UPSCALE,
            interpolation=cv2.INTER_CUBIC
        )

    else:

        inference_frame = frame


    # --------------------------------------------------------
    # YOLO + BYTETRACK
    # --------------------------------------------------------

    results = model.track(
        inference_frame,
        persist=True,
        tracker="bytetrack.yaml",
        conf=CONFIDENCE,
        imgsz=IMAGE_SIZE,
        verbose=False
    )

    result = results[0]


    # --------------------------------------------------------
    # START WITH ORIGINAL FRAME
    # --------------------------------------------------------

    annotated_frame = frame.copy()

    current_potholes = 0


    # ========================================================
    # PROCESS DETECTIONS
    # ========================================================

    if (
        result.boxes is not None
        and len(result.boxes) > 0
    ):

        current_potholes = len(
            result.boxes
        )


        # ----------------------------------------------------
        # BOXES
        # ----------------------------------------------------

        boxes = (
            result.boxes.xyxy
            .cpu()
            .tolist()
        )


        # ----------------------------------------------------
        # CONFIDENCES
        # ----------------------------------------------------

        confidences = (
            result.boxes.conf
            .cpu()
            .tolist()
        )


        # ----------------------------------------------------
        # TRACK IDS
        # ----------------------------------------------------

        ids = result.boxes.id

        if ids is not None:

            track_ids = (
                ids
                .int()
                .cpu()
                .tolist()
            )

        else:

            track_ids = [
                None
                for _ in boxes
            ]


        # ====================================================
        # PROCESS EACH POTHOLE
        # ====================================================

        for (
            box,
            track_id,
            confidence
        ) in zip(
            boxes,
            track_ids,
            confidences
        ):

            # ------------------------------------------------
            # ORIGINAL BOX COORDINATES
            # ------------------------------------------------

            x1, y1, x2, y2 = map(
                int,
                box
            )


            # ------------------------------------------------
            # CONVERT UPSCALED COORDINATES
            # ------------------------------------------------

            x1 = int(
                x1 / UPSCALE
            )

            y1 = int(
                y1 / UPSCALE
            )

            x2 = int(
                x2 / UPSCALE
            )

            y2 = int(
                y2 / UPSCALE
            )


            # ------------------------------------------------
            # CLAMP COORDINATES
            # ------------------------------------------------

            x1 = max(
                0,
                min(
                    x1,
                    original_width - 1
                )
            )

            y1 = max(
                0,
                min(
                    y1,
                    original_height - 1
                )
            )

            x2 = max(
                0,
                min(
                    x2,
                    original_width - 1
                )
            )

            y2 = max(
                0,
                min(
                    y2,
                    original_height - 1
                )
            )


            # ------------------------------------------------
            # POTHOLE DIMENSIONS
            # ------------------------------------------------

            pothole_width = max(
                0,
                x2 - x1
            )

            pothole_height = max(
                0,
                y2 - y1
            )

            pothole_area = (
                pothole_width
                * pothole_height
            )


            # ------------------------------------------------
            # AREA PERCENTAGE
            # ------------------------------------------------

            frame_area = (
                original_width
                * original_height
            )

            if frame_area > 0:

                area_percent = (
                    pothole_area
                    / frame_area
                ) * 100

            else:

                area_percent = 0


            # ------------------------------------------------
            # SIZE CATEGORY
            # ------------------------------------------------

            size_category = (
                classify_pothole_size(
                    area_percent
                )
            )


            # ------------------------------------------------
            # COLOR
            # ------------------------------------------------

            if size_category == "SMALL":

                box_color = (
                    255,
                    255,
                    0
                )

            elif size_category == "MEDIUM":

                box_color = (
                    0,
                    255,
                    255
                )

            else:

                box_color = (
                    0,
                    0,
                    255
                )


            # =================================================
            # DRAW BOUNDING BOX
            # =================================================

            cv2.rectangle(
                annotated_frame,
                (x1, y1),
                (x2, y2),
                box_color,
                3
            )


            # =================================================
            # LABEL PANEL
            # =================================================

            panel_width = 245
            panel_height = 92

            label_x = x1

            label_y = (
                y1
                - panel_height
                - 5
            )

            if label_y < 5:

                label_y = y2 + 5

            if (
                label_x
                + panel_width
                > original_width
            ):

                label_x = (
                    original_width
                    - panel_width
                    - 5
                )

            if (
                label_y
                + panel_height
                > original_height
            ):

                label_y = (
                    original_height
                    - panel_height
                    - 5
                )


            # ------------------------------------------------
            # PANEL
            # ------------------------------------------------

            cv2.rectangle(
                annotated_frame,
                (
                    label_x,
                    label_y
                ),
                (
                    label_x
                    + panel_width,
                    label_y
                    + panel_height
                ),
                (0, 0, 0),
                -1
            )


            # ------------------------------------------------
            # TRACK ID
            # ------------------------------------------------

            if track_id is not None:

                id_text = (
                    f"Pothole #{track_id}"
                )

            else:

                id_text = "Pothole"


            cv2.putText(
                annotated_frame,
                id_text,
                (
                    label_x + 7,
                    label_y + 19
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.50,
                (255, 255, 255),
                1
            )


            # ------------------------------------------------
            # CONFIDENCE
            # ------------------------------------------------

            cv2.putText(
                annotated_frame,
                (
                    f"Confidence: "
                    f"{confidence:.2f}"
                ),
                (
                    label_x + 7,
                    label_y + 38
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.43,
                (255, 255, 255),
                1
            )


            # ------------------------------------------------
            # SIZE
            # ------------------------------------------------

            cv2.putText(
                annotated_frame,
                (
                    f"Size: "
                    f"{size_category}"
                ),
                (
                    label_x + 7,
                    label_y + 57
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.50,
                box_color,
                2
            )


            # ------------------------------------------------
            # DIMENSIONS
            # ------------------------------------------------

            cv2.putText(
                annotated_frame,
                (
                    f"{pothole_width}x"
                    f"{pothole_height}px "
                    f"| {area_percent:.2f}%"
                ),
                (
                    label_x + 7,
                    label_y + 78
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.37,
                (0, 255, 255),
                1
            )


            # =================================================
            # NEW UNIQUE POTHOLE
            # =================================================

            if track_id is not None:

                if (
                    track_id
                    not in seen_pothole_ids
                ):

                    # -----------------------------------------
                    # REGISTER UNIQUE POTHOLE
                    # -----------------------------------------

                    seen_pothole_ids.add(
                        track_id
                    )

                    total_unique_potholes += 1


                    # -----------------------------------------
                    # TIMESTAMP
                    # -----------------------------------------

                    timestamp = (
                        datetime.now()
                        .strftime(
                            "%Y%m%d_%H%M%S_%f"
                        )
                    )


                    # =========================================
                    # FULL FRAME SNAPSHOT
                    # =========================================

                    snapshot_name = (
                        f"pothole_"
                        f"{total_unique_potholes:04d}"
                        f"_track_{track_id}_"
                        f"{timestamp}.jpg"
                    )

                    snapshot_path = os.path.join(
                        SNAPSHOT_DIR,
                        snapshot_name
                    )

                    cv2.imwrite(
                        snapshot_path,
                        annotated_frame
                    )


                    # =========================================
                    # POTHOLE CROP
                    # =========================================

                    crop = frame[
                        y1:y2,
                        x1:x2
                    ]

                    if (
                        crop is not None
                        and crop.size > 0
                    ):

                        crop_name = (
                            f"pothole_"
                            f"{total_unique_potholes:04d}"
                            f"_track_{track_id}_"
                            f"{size_category}_"
                            f"{timestamp}.jpg"
                        )

                        crop_path = os.path.join(
                            CROP_DIR,
                            crop_name
                        )

                        cv2.imwrite(
                            crop_path,
                            crop
                        )

                    else:

                        crop_path = None


                    # =========================================
                    # UPLOAD SNAPSHOT TO SUPABASE
                    # =========================================

                    snapshot_storage_path = (
                        f"{BUS_ID}/snapshots/"
                        f"{snapshot_name}"
                    )

                    snapshot_url = (
                        upload_pothole_image(
                            snapshot_path,
                            snapshot_storage_path,
                            "Snapshot"
                        )
                    )


                    # =========================================
                    # UPLOAD CROP TO SUPABASE
                    # =========================================

                    crop_url = None

                    if crop_path is not None:

                        crop_storage_path = (
                            f"{BUS_ID}/crops/"
                            f"{crop_name}"
                        )

                        crop_url = (
                            upload_pothole_image(
                                crop_path,
                                crop_storage_path,
                                "Crop"
                            )
                        )


                    # =========================================
                    # GET GPS
                    # =========================================

                    latitude, longitude = (
                        get_current_gps()
                    )


                    # =========================================
                    # CREATE EVENT
                    # =========================================

                    pothole_event = (
                        create_pothole_event(
                            bus_id=BUS_ID,
                            pothole_id=track_id,
                            confidence=confidence,
                            size_category=size_category,
                            width_px=pothole_width,
                            height_px=pothole_height,
                            area_px=pothole_area,
                            area_percent=area_percent,
                            latitude=latitude,
                            longitude=longitude,
                            snapshot_path=snapshot_url,
                            crop_path=crop_url
                        )
                    )


                    # =========================================
                    # EVENT LOG
                    # =========================================

                    print()

                    print(
                        "========================================"
                    )

                    print(
                        "[POTHOLE EVENT GENERATED]"
                    )

                    print(
                        pothole_event
                    )

                    # =========================================
                    # SEND EVENT TO FASTAPI
                    # =========================================

                    send_pothole_event(
                        pothole_event
                    )


                    # =========================================
                    # CONSOLE INFORMATION
                    # =========================================

                    print(
                        "[NEW POTHOLE DETECTED]"
                    )

                    print(
                        f"Track ID       : "
                        f"{track_id}"
                    )

                    print(
                        f"Confidence     : "
                        f"{confidence:.2f}"
                    )

                    print(
                        f"Size Category  : "
                        f"{size_category}"
                    )

                    print(
                        f"Width          : "
                        f"{pothole_width}px"
                    )

                    print(
                        f"Height         : "
                        f"{pothole_height}px"
                    )

                    print(
                        f"Area           : "
                        f"{pothole_area}px2"
                    )

                    print(
                        f"Frame Area     : "
                        f"{area_percent:.2f}%"
                    )

                    print(
                        f"Local Snapshot : "
                        f"{snapshot_path}"
                    )

                    print(
                        f"Local Crop     : "
                        f"{crop_path}"
                    )

                    print(
                        f"Snapshot URL   : "
                        f"{snapshot_url}"
                    )

                    print(
                        f"Crop URL       : "
                        f"{crop_url}"
                    )

                    print(
                        "========================================"
                    )


    # ========================================================
    # DASHBOARD
    # ========================================================

    cv2.rectangle(
        annotated_frame,
        (10, 10),
        (455, 130),
        (0, 0, 0),
        -1
    )


    # Current potholes

    cv2.putText(
        annotated_frame,
        (
            f"Current Potholes: "
            f"{current_potholes}"
        ),
        (25, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 0),
        2
    )


    # Unique potholes

    cv2.putText(
        annotated_frame,
        (
            f"Unique Potholes: "
            f"{total_unique_potholes}"
        ),
        (25, 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 255),
        2
    )


    # Frame

    cv2.putText(
        annotated_frame,
        f"Frame: {frame_number}/{total_frames}",
        (25, 98),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.52,
        (255, 255, 255),
        1
    )


    # Configuration

    cv2.putText(
        annotated_frame,
        (
            f"Conf: {CONFIDENCE} "
            f"| ImgSz: {IMAGE_SIZE}"
        ),
        (25, 118),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (180, 180, 180),
        1
    )


    # ========================================================
    # SAVE FRAME
    # ========================================================

    writer.write(
        annotated_frame
    )


    # ========================================================
    # DISPLAY
    # ========================================================

    cv2.imshow(
        WINDOW_NAME,
        annotated_frame
    )


    # ========================================================
    # QUIT
    # ========================================================

    key = (
        cv2.waitKey(1)
        & 0xFF
    )

    if key == ord("q"):

        print(
            "Q pressed. Stopping..."
        )

        break


# ============================================================
# CLEANUP
# ============================================================

cap.release()

writer.release()

cv2.destroyAllWindows()


# ============================================================
# FINAL SUMMARY
# ============================================================

print()

print(
    "========================================"
)

print(
    "POTHOLE DETECTION COMPLETE"
)

print(
    "========================================"
)

print(
    f"Total unique potholes: "
    f"{total_unique_potholes}"
)

print(
    f"Tracking video: "
    f"{OUTPUT_VIDEO}"
)

print(
    f"Full snapshots: "
    f"{SNAPSHOT_DIR}"
)

print(
    f"Pothole crops: "
    f"{CROP_DIR}"
)

print(
    "Supabase Storage: "
    "pothole-images"
)

print(
    "========================================"
)