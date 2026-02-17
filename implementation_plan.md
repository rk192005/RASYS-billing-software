# Rasys Billing - Full Stack Implementation Plan

## 1. Project Overview
**Rasys Billing** will be a comprehensive billing and invoicing web application inspired by Zoho Billing. It will feature a modern frontend for user interaction and a robust backend for data management.

**Target Output:** A professional, full-stack application running locally.
**Workspace:** `/Users/rajkumar/Desktop/rk-billing`

## 2. Technology Stack

### Frontend (Client)
- **Framework:** React (Vite)
- **Styling:** Vanilla CSS (Advanced Design System with Variables)
- **Icons:** Lucide React
- **Features:** Dashboard, Invoice Editor, Client Management, Print/PDF Generation.

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** LowDB (Local JSON database for easy setup and portability) or SQLite. *Decision: LowDB for zero-config persistence.*
- **API:** RESTful endpoints for Invoices, Clients, and Products.

## 3. Architecture

Root Directory: `rasys-billing`
├── `client/` (React App)
│   ├── `src/`
│   │   ├── `components/` (UI Components)
│   │   ├── `pages/` (Dashboard, Invoices, Settings)
│   │   ├── `services/` (API calls to backend)
│   │   └── `styles/` (CSS Design System)
│   └── `package.json`
├── `server/` (Node API)
│   ├── `data/` (JSON Storage)
│   ├── `routes/` (API Routes)
│   ├── `index.js` (Server Entry)
│   └── `package.json`
└── `package.json` (Root scripts to run both)

## 4. Key Features (Phase 1: MVP)

1.  **Dashboard**:
    *   Metrics: Total Revenue, Outstanding Invoices.
    *   Recent Activity Feed.
2.  **Invoice Management**:
    *   Create, Edit, Delete Invoices.
    *   Live Preview (Split View).
    *   Print to PDF (A4/A5, Portrait/Landscape).
3.  **Entity Management**:
    *   **Customers**: Add/Edit Client details.
    *   **Products**: Manage Item catalog with Prices and Units.
4.  **Backend Integration**:
    *   All data saved permanently to the local server.

## 5. Development Steps

1.  **Setup**: Initialize root, client, and server project structures.
2.  **Backend**: Set up Express server with LowDB for data storage.
3.  **Frontend Core**: logical layout and CSS design system (Zoho-like blue theme).
4.  **Frontend Modules**: Build Dashboard, Invoice Editor, and Settings pages.
5.  **Integration**: Connect Frontend forms to Backend APIs.

---
**Ready to Initialize Project Structure.**
