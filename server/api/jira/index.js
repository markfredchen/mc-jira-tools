'use strict'

var express = require('express');
var controller = require('./jira.controller');

var router = express.Router();

router.post('/issues', controller.getAllIssues);
router.get('/teams', controller.getTeams);

module.exports = router;
