## POS Device Control — Backend
[Frontend (GitHub Pages)](https://digsix.github.io/frontendControlePOSDevice)

### About

This repository contains the backend for a system built to manage **POS devices** (card terminals) moving in and out of stock.

The tool was created to replace a spreadsheet-based workflow and provide a more reliable and structured way for technicians to track devices, status, and inventory changes.

### What it does

- Authentication endpoint (static user for now)  
- Create and update POS devices  
- Filter devices by multiple fields  
- MySQL database integration  
- CORS support for a separate frontend hosted on GitHub Pages  

### Stack

- Node.js  
- Express  
- MySQL2 (connection pool)  
- dotenv  
- cors  

### Status

This project is still under development.  
It already solves the core inventory problem and serves as a foundation for future improvements and refinements.

Maintained by [DigSix](https://github.com/DigSix)
