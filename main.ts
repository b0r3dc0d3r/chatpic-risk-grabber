import { CPGrabber, CPGrabberOptions } from "./src/grabber";

// set options

const CP_GRABBER_OPTIONS: CPGrabberOptions = {
  room: '15min',
  splitByOwner: true,
  keywords: [
    'risk',
    '10s',
    '5s',
    '3s'
  ],
  saveAllMedia: false, // set true to disable keywords filter and save all media
};

// showtime!

new CPGrabber(CP_GRABBER_OPTIONS);