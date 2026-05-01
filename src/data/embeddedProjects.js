import GreenHouse from '../img/projects/green_house.jpg'
import GHG from '../img/projects/ghg.jpg'
import ACCIMT from '../img/projects/helmholtz.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'
// import GreenHouse from '../img/projects/green_house.jpg'



export const embeddedProjects = [
  {
    id: 1,
    type : "embedded",
    title: "Fuzzy Matrix Processing Unit",
    description: "Architected a dedicated hardware accelerator using VHDL to perform Fuzzy Matrix operations. Validated design integrity through testbenches and post-synthesis timing simulations in Xilinx Vivado. Implemented and verified the synthesized design on a Nexys A7 Development Board (Artix-7 FPGA).",
    image: "/placeholder.svg",
    technologies: ["VHDL", "Xilinx Vivado", "FPGA (Artix-7)", "Digital System Design"],
    githubUrl: "https://github.com/FazeelNizam/Fuzzy-Matrix-Processing-Unit",
    liveUrl: null,
    category: "FPGA Design",
    features: [
      "Hardware accelerator",
      "Fuzzy Matrix operations",
      "Post-synthesis timing simulations",
      "Nexys A7 implementation"
    ],
    status: "Completed"
  },
  {
    id: 2,
    type : "embedded",
    title: "Multi-Unit Environmental & Agricultural Monitoring System",
    description: "Architected a distributed system with three wireless ESP32 nodes for real-time environmental and soil monitoring. Programmed a self-sufficient weather station capable of parsing complex SDI-12 protocols and logging timestamped data.",
    image: GreenHouse,
    technologies: ["ESP32", "Pi Zero", "Embedded C", "Python", "MQTT"],
    githubUrl: "https://github.com/FazeelNizam/green_house_monitoring_system",
    liveUrl: null,
    category: "IoT",
    features: [
      "Real-time sensor monitoring",
      "High data accuracy",
      "Multi-protocol compatibility",
      "3-2-1 backup rule for data availability",
    ],
    status: "Ongoing"
  },
  {
    id: 3,
    type : "embedded",
    title: "Portable GHG Analyzer for Agricultural Field Research",
    description: "Built a standalone, keypad-operated device for precision GHG measurement, improving field research efficiency. Implemented a dual-file system (SPIFFS & SD card) and automated control for air circulation and stabilization.",
    image: GHG,
    technologies: ["ESP32", "Embedded C", "SPIFFS", "SD Card", "Sensors"],
    githubUrl: "https://github.com/FazeelNizam/portable_ghg_analyzer",
    liveUrl: null,
    category: "Instrumentation",
    features: [
      "Laboratory-grade accuracy",
      "Dual-file logging system",
      "Automated air circulation",
      "Keypad operation"
    ],
    status: "Completed"
  },
  {
    id: 4,
    type : "embedded",
    title: "Helmholtz Cage - Nano Sterlite Orbital Magnetic Field Simulation",
    description: "Implemented IoT power control with a web dashboard hosted in ESP32 for remote monitoring. Developed a self-balancing, frictionless air-bearing platform using PID algorithm.",
    image: ACCIMT,
    technologies: ["ESP32", "Embedded C", "Python", "HTML", "CSS"],
    githubUrl: "https://github.com/FazeelNizam",
    liveUrl: null,
    category: "Aerospace Testing",
    features: [
      "Web dashboard hosted in ESP32",
      "PID self-balancing platform",
      "Frictionless air-bearing",
      "Remote monitoring"
    ],
    status: "Completed"
  },
  {
    id: 5,
    type : "embedded",
    title: "Smart Water Management System",
    description: "Built a distributed IoT water-monitoring network with solar-powered LoRa sub-stations and a Wi-Fi base station for secure AWS IoT cloud integration. Streamed AES-encrypted sensor data via MQTT.",
    image: "/placeholder.svg",
    technologies: ["ESP32", "Embedded C", "FreeRTOS", "LoRa", "AWS IoT", "MQTT", "Blynk IoT"],
    githubUrl: "https://github.com/FazeelNizam/Smart_Water_Management_System",
    liveUrl: null,
    category: "IoT Networks",
    features: [
      "Solar-powered LoRa sub-stations",
      "AWS IoT integration",
      "AES-encrypted data streaming",
      "Real-time Blynk dashboard"
    ],
    status: "Completed"
  },
  {
    id: 6,
    type : "embedded",
    title: "WPCU - Water Pump Control Unit",
    description: "Designed and implemented an FSM-based control system for efficient water management. Developed and tested the system on an FPGA development board.",
    image: "/placeholder.svg",
    technologies: ["FPGA", "VHDL", "Vivado"],
    githubUrl: "https://github.com/FazeelNizam/WPCU",
    liveUrl: null,
    category: "FPGA Design",
    features: [
      "FSM-based control system",
      "Efficient water management",
      "Hardware implementation"
    ],
    status: "Completed"
  }
]
