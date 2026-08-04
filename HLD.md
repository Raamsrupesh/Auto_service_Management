SMART SHARED TRANSPORT MANAGEMENT SYSTEM
HIGH LEVEL DESIGN (HLD)

Student App
     │
     ▼
Driver App
     │
     ▼
Admin Panel
     │
     ▼
──────────────────────────────────────────
        Backend Server (Node.js + Express)
──────────────────────────────────────────
     │
     ├── Authentication Service
     │
     ├── Subscription Management Service
     │
     ├── Student Availability Service
     │
     ├── Transport Allocation Engine
     │
     ├── Notification Service
     │
     ├── Trip Management Service
     │
     └── revenue management service
     │
     ▼
──────────────────────────────────────────
             MongoDB Database
──────────────────────────────────────────
     │
     ├── Users
     ├── Students
     ├── Drivers
     ├── Routes
     ├── Subscriptions
     ├── Trips
     ├── Auto Allocations
     ├── Revenue Records
     └── Notifications
     │
     ▼
──────────────────────────────────────────
External Services
──────────────────────────────────────────
• Google Maps API (Location Services)
• Socket.IO (Real-Time Communication)
• Firebase Cloud Messaging (Push Notifications)