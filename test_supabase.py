from backend.supabase_events import save_event


traffic_event = {
    "event_type": "TRAFFIC",
    "bus_id": "BUS_101",
    "vehicle_count": 29,
    "average_vehicle_count": 27.8,
    "traffic_level": "HIGH",
    "latitude": 18.503079,
    "longitude": 73.7731634,
    "status": "DETECTED",
}


pothole_event = {
    "event_type": "POTHOLE",
    "bus_id": "BUS_101",
    "pothole_id": 999,
    "confidence": 0.85,
    "size_category": "MEDIUM",
    "width_px": 150,
    "height_px": 80,
    "area_px": 12000,
    "area_percent": 1.2,
    "latitude": 18.503079,
    "longitude": 73.7731634,
    "snapshot_path": "test/snapshot.jpg",
    "crop_path": "test/crop.jpg",
    "status": "DETECTED",
}


print("\nSaving TRAFFIC event...")
traffic_result = save_event(traffic_event)
print("TRAFFIC saved:")
print(traffic_result)


print("\nSaving POTHOLE event...")
pothole_result = save_event(pothole_event)
print("POTHOLE saved:")
print(pothole_result)