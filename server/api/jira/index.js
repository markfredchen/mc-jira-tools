'use strict'

var express = require('express');
var controller = require('./jira.controller');

var router = express.Router();

router.post('/issues', controller.getAllIssues);
router.get('/teams', controller.getTeams);
router.post('/sprintReview', controller.getSprintReviewData);

module.exports = router;
