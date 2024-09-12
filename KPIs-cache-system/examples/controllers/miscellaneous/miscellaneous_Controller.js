var express = require('express');
var router = express.Router();

// base path - /api/misc

router.get("/current-server-time", (routerRequest, routerResponse) => {
    let currentTime = new Date().getTime();
    routerResponse.status(200).json(currentTime);
});

module.exports = router;