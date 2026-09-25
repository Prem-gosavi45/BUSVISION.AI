import cv2
from ultralytics import YOLO


MODEL_PATH = "ai/models/yolo26s.pt"
VIDEO_PATH = "data/video/bus_test.mp4"
OUTPUT_PATH = "data/video/detection_output.mp4"


def run_detection():

    print("Loading YOLO26s model...")

    model = YOLO(MODEL_PATH)

    print("Opening video...")

    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: {VIDEO_PATH}"
        )

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    print(f"Resolution: {width}x{height}")
    print(f"FPS: {fps}")
    print(f"Total frames: {total_frames}")

    # Output video writer
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
            "Could not create output video."
        )

    frame_count = 0

    print("Starting YOLO detection...")

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        # YOLO inference
        results = model(
            frame,
            verbose=False
        )

        # Draw bounding boxes
        annotated_frame = results[0].plot()

        # Save frame to output video
        writer.write(
            annotated_frame
        )

        # Show progress
        if frame_count % 20 == 0:

            print(
                f"Processed: "
                f"{frame_count}/{total_frames}"
            )

        # Display
        cv2.imshow(
            "YOLO26s - BusVision",
            annotated_frame
        )

        # Press Q to stop
        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("Stopped by user.")
            break

    # Cleanup
    cap.release()
    writer.release()
    cv2.destroyAllWindows()

    print()
    print("Detection completed.")
    print(
        f"Processed frames: {frame_count}"
    )
    print(
        f"Output saved to: {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    run_detection()