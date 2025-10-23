const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/collections', dataController.listCollections);
router.get('/:collection', dataController.queryCollection);

module.exports = router;
