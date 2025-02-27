# RFID – Based library Management System

### Group 13 - Cyber Punks

## Project Overview

The RFID-Based Library Management System is designed to streamline book check-in and check-out process in a library using RC522 RFID readers and a PC-based management system. This system automates the identification of books and library members, reducing effort and improving efficiency.

## Hardware Components

| **Component**         | **Description**                                                       |
|-----------------------|-----------------------------------------------------------------------|
| **RC522 RFID Reader** | Scans RFID tags attached to the books and library cards.              |
| **RFID Tags**         | Attach to the books and library cards for identification.             |
| **ESP32 Microcontroller**   | Processes signals from the RFID reader and communicates with the PC.  |
| **Personal Computer** | Runs the software and stores the database.                            |
| **Power Supply**      | Provides necessary power to the system components.                    |

## Software Components

🔹 Arduino IDE – Used for ESP32 programming <br />
🔹 Firebase Realtime Database – Stores and syncs sensor data and the Web Application