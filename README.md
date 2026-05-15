# Code_ENDGAME-

Project Overview:
The Energy Consumption Optimizer (ECO) is an intelligent system designed to automate energy management. By leveraging computer vision and machine learning, the system optimizes electricity usage based on real-time human presence and environmental conditions.

Core Modules:
1.	Human Detection (Vision System)
•	Uses YOLOv8 for high-accuracy human presence detection.
•	Automated circuit breaking after 6-9 seconds of inactivity.

2.	Intelligent Anomaly Detection
•	Integrated DHT sensors for temperature and humidity tracking.
•	ML-driven analysis to differentiate between high occupancy heat and actual fire/technical hazards.
•	Immediate sensory feedback via Red LED and Buzzer alerts.

Technical Architecture:
•	Controller: ESP32 / Laptop (Python Backend)
•	Detection Model: YOLOv8 (Single Class)
•	Sensors/Actuators: Temperature Sensor, Red LEDs, Buzzer
 
Future Roadmap:
The next phase involves "Event Detection" where camera data will be fed directly into optimized ML models for even more precise control and predictive energy analytics.

