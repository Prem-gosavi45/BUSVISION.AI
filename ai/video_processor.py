
import cv2
import time


def process_video(video_path: str):
    print(f"Opening video: {video_path}")

    # Open video
    cap = cv2.VideoCapture(video_path)

    # Check if video opened successfully
    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: {video_path}"
        )

    # Get video information
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Resolution: {width}x{height}")
    print(f"Video FPS: {video_fps}")
    print(f"Total frames: {total_frames}")

    # Frame counter
    frame_count = 0

    # Start timer
    start_time = time.time()

    while True:

        # Read one frame
        ret, frame = cap.read()

        # Stop when video ends
        if not ret:
            break

        frame_count += 1

        # Save the first frame
        if frame_count == 1:
            cv2.imwrite(
                "data/video/first_frame.jpg",
                frame
            )
            print("First frame saved.")

        # Calculate processing FPS
        elapsed_time = time.time() - start_time
        processing_fps = frame_count / max(
            elapsed_time,
            0.001
        )

        # Display processing FPS
        cv2.putText(
            frame,
            f"FPS: {processing_fps:.1f}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        # Display frame number
        cv2.putText(
            frame,
            f"Frame: {frame_count}/{total_frames}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        # Display video
        cv2.imshow(
            "BusVision - Camera Feed",
            frame
        )

        # Press Q to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release video
    cap.release()

    # Close OpenCV windows
    cv2.destroyAllWindows()

    print(f"Processed frames: {frame_count}")

