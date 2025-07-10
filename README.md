# 📦 Foundify - Lost & Found Web App

## 📊 Project Architecture Diagram

```mermaid
graph TD
  A[User] -->|Accesses via Browser| B[Foundify Web App]
  B -->|Sends Request| C[Express.js Server]

  C -->|Renders Views| D[EJS Templates]
  C -->|CRUD API Calls| E[MongoDB Database]
  C -->|Real-time Messages| F[Socket.io Server]

  F -->|Chat & Notifications| A

  E -->|Stores| G[User Data]
  E -->|Stores| H[Lost & Found Items]
  E -->|Stores| I[Messages & Notifications]

  B -->|Static Files| J[Public (HTML, CSS, JS)]

  subgraph 📦 Routes
    C1[/items.js/]
    C2[/user.js/]
    C3[/chat.js/]
    C4[/notification.js/]
  end

  C --> C1
  C --> C2
  C --> C3
  C --> C4
```
