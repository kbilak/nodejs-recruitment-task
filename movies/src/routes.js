const express = require("express");
const router = express.Router();
const { create, list, token, role } = require('../services');

router.post('/', token, role, create)
router.get('', token, list)

module.exports = router;