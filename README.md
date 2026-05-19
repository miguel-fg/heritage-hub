<p align="center">
<img src="./client/public/HH_white.png" width="200" height="200" alt="Intelliquiz logo"/>
</p>
<h1 align="center">
Heritage Hub
</h1>

A 3D museum artifact platform for exploring, managing, and preserving cultural heritage through interactive web-based visualizations.

## Overview

Heritage Hub is a full-stack web application designed for cultural heritage preservation and education. The platform enables users to browse, interact with, and learn from 3D digitized museum artifacts through an interactive web interface. Built with modern web technologies, it provides scalable storage and efficient rendering of complex 3D models with rich metadata.

## Features

### Public Access

- **3D Model Browser:** Explore the collection of digitized museum artifacts
- **Interactive Visualization:** Manipulate 3D models using the Three.js-powered viewer
- **Metadata Display:** Access detailed information including descriptions, dimensions, materials, and tags
- **Advanced Search:** Filter artifacts by tags, materials, and other metadata attributes
- **Hotspot System:** Interactive points of interest on models that reveal additional contextual information

### Authenticated Users

- **CRUD operations:** Upload and manage 3D artifacts
- **CAS Integration:** Secure authentication through SFU's Central Authentication Service
- **Role-Based Access Control:** Tiered permission system over app's features

## Technical Architecture

### Frontend

- **Vue.js:** Component-based UI framework
- **Pinia:** State management store library for Vue
- **Three.js:** WebGL-based 3D rendering and interaction
- **Responsive Design:** Cross-device compatibility

### Backend
- **Node.js / Express:** REST API server
- **Prisma:** ORM for database access and schema management
- **PostgreSQL (Neon):** Serverless relational database
- **Multer:** Middleware for handling multipart file uploads
- **Sharp:** Image optimization pipeline before asset delivery
- **Custom CAS Integration:** Authentication flow built on [The Copenhagen Book](https://thecopenhagenbook.com/) guidelines — redirects to SFU's CAS server
- **Cloudflare R2:** Object storage for 3D model and image asset delivery

### Testing
- **Vitest:** Unit testing across both client and server

## Deployment
Both the client and server are hosted on **Render**.
- **Client:** Vue.js app served as a static site
- **Server:** Express API running as a web service
- **Database:** Managed PostgreSQL instance via Neon
- **Assets:** Delivered via Cloudflare R2
