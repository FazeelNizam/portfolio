export const embeddedProjects = [
  {
    id: 1,
    type : "embedded",
    title: "Smart Home Automation System",
    description: "IoT-based home automation system using ESP32 and Arduino with mobile app control. Features include smart lighting, temperature control, security monitoring, and energy management.",
    image: "/api/placeholder/400/300",
    technologies: ["Arduino", "ESP32", "C++", "IoT", "Bluetooth", "WiFi", "Mobile App"],
    githubUrl: "https://github.com/FazeelNizam/smart-home-automation",
    liveUrl: null,
    category: "IoT",
    features: [
      "Real-time sensor monitoring",
      "Mobile app control",
      "Energy consumption tracking",
      "Security alerts",
      "Voice control integration"
    ],
    status: "Completed",
    duration: "3 months"
  },
  {
    id: 2,
    type : "embedded",
    title: "Precision Robotic Arm Controller",
    description: "High-precision robotic arm control system with computer vision integration. Capable of object detection, pick-and-place operations, and automated assembly tasks.",
    image: "/api/placeholder/400/300",
    technologies: ["Arduino", "Python", "OpenCV", "Stepper Motors", "Computer Vision", "ROS"],
    githubUrl: "https://github.com/FazeelNizam/robotic-arm-controller",
    liveUrl: null,
    category: "Robotics",
    features: [
      "Computer vision integration",
      "Precision movement control",
      "Object detection and tracking",
      "Automated assembly",
      "Real-time feedback system"
    ],
    status: "In Progress",
    duration: "6 months"
  },
  {
    id: 3,
    type : "embedded",
    title: "Weather Station with Data Logging",
    description: "Comprehensive weather monitoring station with real-time data collection, cloud storage, and web dashboard for weather analysis and forecasting.",
    image: "/api/placeholder/400/300",
    technologies: ["Arduino", "Raspberry Pi", "Python", "SQLite", "Web Dashboard", "Cloud Storage"],
    githubUrl: "https://github.com/FazeelNizam/weather-station",
    liveUrl: "https://weather-station-demo.vercel.app",
    category: "Environmental Monitoring",
    features: [
      "Multi-sensor data collection",
      "Real-time web dashboard",
      "Historical data analysis",
      "Weather forecasting",
      "Mobile notifications"
    ],
    status: "Completed",
    duration: "2 months"
  },
  {
    id: 4,
    type : "embedded",
    title: "Smart Irrigation System",
    description: "Automated irrigation system with soil moisture sensors, weather prediction, and water conservation features for efficient agricultural water management.",
    image: "https://github.com/FazeelNizam/green_house_monitoring_system/blob/main/Images/Logger%20Circuit.jpg",
    technologies: ["ESP32", "Soil Sensors", "Whether Station", "Pi Zero", "MQTT"],
    githubUrl: "https://github.com/FazeelNizam/green_house_monitoring_system",
    liveUrl: null,
    category: "Agriculture Tech",
    features: [
      "Soil moisture monitoring",
      "Weather-based scheduling",
      "Water conservation",
      "Remote control",
      "Data analytics"
    ],
    status: "Completed",
    duration: "4 months"
  }
]
