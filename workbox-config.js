/* eslint-disable quotes */
module.exports = {
  "globDirectory": "public",
  "globPatterns": [
    "**/*.{html,ico,json,css}",
    "src/images/*.{jpg, png}",
    "src/js/*.min.js"
  ],
  "swSrc": "public/sw-base.js",
  "swDest": "public/service-worker.js",
  "globIgnores": [
    "help/**"
  ]
};
