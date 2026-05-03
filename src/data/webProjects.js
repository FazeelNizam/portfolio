import chat from '../img/projects/ui.PNG'
import SG from '../img/projects/sg.png'
import WMS from '../img/projects/wms.png'
import research from '../img/projects/research.png'

export const webProjects = [
  {
    id: 1,
    type : "web",
    title: "SecureGate - IoT Access Control System",
    description: "Designed custom PCB hardware and managed the complete end-to-end deployment lifecycle. Architected a multi-VM infrastructure utilizing an Nginx-powered load balancer, a dedicated MQTT broker, and a unified Application VM hosting both the frontend and backend.",
    image: SG,
    technologies: ["FastAPI", "ReactJS", "PostgreSQL", "MQTT", "WebSocket", "Nginx", "CI/CD"],
    githubUrl: "https://github.com/FazeelNizam/securegate_slt",
    liveUrl: null,
    category: "Full-Stack System",
    features: [
      "Custom PCB Hardware",
      "Multi-VM infrastructure",
      "Nginx load balancing",
      "RSA encrypted communication"
    ],
    status: "Completed"
  },
  {
    id: 2,
    type : "web",
    title: "Social Learning Platform - Realtime Chat App",
    description: "Integrated Stream.io API for real-time chat functionality and designed a customized user interface for enhanced user experience in a university-level social platform.",
    image: chat,
    technologies: ["ReactJS", "NodeJS", "Stream.io"],
    githubUrl: "https://github.com/FazeelNizam/social_learning_platform",
    liveUrl: null,
    category: "Full-Stack Web App",
    features: [
      "Real-time chat functionality",
      "Custom UI/UX",
      "User authentication",
      "Group discussions"
    ],
    status: "Completed"
  },
  {
    id: 3,
    type : "web",
    title: "IoT Weight Measurement System Dashboard",
    description: "Designed a real-time IoT data visualization dashboard and integrated backend API using Axios for data retrieval for the Neo Space Lab.",
    image: WMS,
    technologies: ["NextJS", "CSS", "Material-UI", "Axios"],
    githubUrl: "https://github.com/FazeelNizam/iot-wms-dashboard",
    liveUrl: null,
    category: "Dashboard",
    features: [
      "Real-time data visualization",
      "API integration",
      "Responsive MUI design"
    ],
    status: "Completed"
  },
  {
    id: 4,
    type : "web",
    title: "Research Publication Web App",
    description: "Designed UI/UX for a Research Publication Web App using NextJS and MUI, improving usability and responsiveness for academic researchers.",
    image: research,
    technologies: ["NextJS", "ReactJS", "Material-UI", "Figma"],
    githubUrl: "https://github.com/FazeelNizam/research-publication-admin-dashboard",
    liveUrl: null,
    category: "Web Application",
    features: [
      "Improved UI/UX usability",
      "Academic publication management",
      "Responsive layouts"
    ],
    status: "Completed"
  }
]
