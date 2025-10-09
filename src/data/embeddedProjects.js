import GreenHouse from '../img/projects/green_house.jpg'
import Java from '../img/Logos/java.svg'
import C from '../img/Logos/c.svg'

export const embeddedProjects = [
  {
    id: 1,
    type : "embedded",
    title: "Multi-Unit Environmental & Agricultural Monitoring System",
    description: "Distributed system with three wireless ESP32 nodes for real time environmental and soil monitoring. Wi-Fi–based data pipeline where one node serves sensor data via a JSON API and another consumes and uploads data to the cloud via Pi Zero MQTT Broker. a self-sufficient weather station capable of parsing complex SDI-12 protocols and logging timestamped data.",
    image: GreenHouse,
    technologies: ["ESP32", "Pi Zero", "Embedded C", "Python", "TEROS 10", "TEROS 22", "ATMOS 41"],
    githubUrl: "https://github.com/FazeelNizam/green_house_monitoring_system",
    liveUrl: null,
    category: "IoT",
    features: [
      "Real-time sensor monitoring",
      "High data acuracy",
      "Multi protocol compatibility",
      "3-2-1 backup rule for data availablity",
    ],
    status: "Ongoing",
    duration: null
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
