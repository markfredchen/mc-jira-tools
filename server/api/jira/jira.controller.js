/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var https = require('https');


exports.getAllIssues = function(req, res) {
    var credential = req.body.auth;
    var rapidViewID = req.body.rapidViewID;
    var options = {
        hostname: 'passkey.atlassian.net',
        port: 443,
        path: '/rest/greenhopper/1.0/xboard/work/allData.json?rapidViewId=' + rapidViewID,
        method: 'GET',
        headers: {
            'Authorization': 'Basic '+ credential
        }
    };
    var request = https.request(options, function (response) {
        var result = {};
        result.STATUS = response.statusCode;
        result.HEADERS = JSON.stringify(response.headers);
        result.data = '';
        response.on('data', function (chunk) {
            result.data += chunk;
        });
        response.on('end', function () {
            res.statusCode = response.statusCode;
            if(response.statusCode == 200) {
                var issues = JSON.parse(result.data).issuesData.issues;
                var rnt = {"userStories": []};
                issues.forEach(function (issue) {
                    if (issue.typeName == 'User Story') {
                        rnt.userStories.push({
                            "userStoryID": issue.key,
                            "summary": issue.summary,
                            "tasks": []
                        });
                    } else {
                        var task = {
                            "taskID": issue.key,
                            "summary": issue.summary,
                            "taskState": issue.statusName,
                            "assignee": (issue.assigneeName) ? issue.assigneeName : null,
                            "remaining": issue.trackingStatistic.statFieldValue.text,
                            "todo": "",
                            "type": ""
                        };
                        rnt.userStories.forEach(function (story) {
                            if (story.userStoryID == issue.parentKey) {
                                story.tasks.push(task);
                            }
                        })
                    }
                });
                res.json(JSON.stringify(rnt));
            }else if(response.statusCode == 401 || response.statusCode == 400){

                res.json({"error":"Access Denied by Jira"});
            }

            res.end();
        });
    });

    request.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    request.end();

};

exports.getTeams = function(req, res) {
    res.json({
        "teams":[
            {
                "name": "SC1 Team",
                "rapidViewID": 43,
                "members": ["markfred.chen@lanyon.com","zak.liang@lanyon.com"]
            },
            {
                "name": "SC2 Team",
                "rapidViewID": 44,
                "members": ["tony.zhang@lanyon.com","daniel.liu@lanyon.com"]
            }
        ]
    });
};