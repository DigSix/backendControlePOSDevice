const express = require("express");
const posDeviceRouter = express.Router();
const posDeviceController = require("../controllers/posDeviceController.js");

posDeviceRouter.get("/loadDevices", posDeviceController.getAllDevices);
posDeviceRouter.post("/createDevice", posDeviceController.createDevice);
posDeviceRouter.post("/filterDevices", posDeviceController.filterDevices);
posDeviceRouter.post("/editDevice", posDeviceController.editDevice);
posDeviceRouter.get("/storagedDevices", posDeviceController.getStoredDevices);

module.exports = posDeviceRouter;