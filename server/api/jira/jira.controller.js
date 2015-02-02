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
            if(response.statusCode === 200) {
                var issues = JSON.parse(result.data).issuesData.issues;
                var rnt = {"userStories": []};
                issues.forEach(function (issue) {
                    if (issue.typeName === 'User Story' || issue.typeName === 'Bug') {
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
                            if (story.userStoryID === issue.parentKey) {
                                story.tasks.push(task);
                            }
                        })
                    }
                });

                res.json(JSON.stringify(rnt));
            }else if(response.statusCode === 401 || response.statusCode === 400){

                res.json({"error":"Access Denied by Jira"});
            }else{
                res.json({"error": response.statusCode});
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

exports.getSprintReviewData = function (req, res) {
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
            if(response.statusCode === 200) {
                console.log('get sprint sccusess');
                var issues = JSON.parse(result.data).issuesData.issues;
                var userStoryIDs = [];
                var rnt = {"userStories": []};
                issues.forEach(function (issue) {
                    if (issue.typeName === 'User Story' || issue.typeName === 'Bug') {
                        userStoryIDs.push(issue.key);
                        rnt.userStories.push({
                            "userStoryID": issue.key,
                            "summary": issue.summary,
                            "status": issue.statusName,
                            "countOfDefects": 0,
                            "isNewDev": true,
                            "isNonRoadMap": false
                        });
                    } else {
                        rnt.userStories.forEach(function (story) {
                            if (story.userStoryID === issue.parentKey) {
                                if (issue.typeName === 'Story Bug') {
                                    story.countOfDefects++;
                                }
                            }
                        })
                    }
                });

                var detailOption = {
                    hostname: 'passkey.atlassian.net',
                    port: 443,
                    path: '/rest/api/2/search?jql=Key%20in%20(' + userStoryIDs.join(",") + ')&fields=id,key,aggregatetimespent,aggregatetimeestimate,customfield_10003',
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + credential
                    }
                };
                var detailRequest = https.request(detailOption, function (detailRes) {
                    var r = {};
                    r.STATUS = detailRes.statusCode;
                    r.HEADERS = JSON.stringify(detailRes.headers);
                    r.data = '';
                    detailRes.on('data', function (chunk) {
                        r.data += chunk;
                    });
                    detailRes.on('end', function () {
                        console.log('get issue detail sccusess');
                        res.statusCode = detailRes.statusCode;
                        if(detailRes.statusCode === 200) {
                            var issues = JSON.parse(r.data).issues;
                            issues.forEach(function (issue) {
                                rnt.userStories.forEach(function (story) {
                                    if(story.userStoryID === issue.key) {
                                        story.hoursSpent = issue.fields.aggregatetimespent / 3600;
                                        story.hoursRemain = issue.fields.aggregatetimeestimate / 3600;
                                        story.points = issue.fields.customfield_10003;
                                    }
                                });
                            });
                            res.json(JSON.stringify(rnt));
                        } else if (detailRes.statusCode === 401 || detailRes.statusCode === 400) {
                            res.json({"error": "Access Denied by Jira"});
                        } else {
                            res.json({"error": detailRes.statusCode});
                        }
                        res.end();
                    });
                });
                detailRequest.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });

                // write data to request body
                detailRequest.end();
            }else if(response.statusCode === 401 || response.statusCode === 400){

                res.json({"error":"Access Denied by Jira"});
                res.end();
            }else{
                res.json({"error": response.statusCode});
                res.end();
            }
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
                "members": [
                    "markfred.chen@lanyon.com",
                    "zak.liang@lanyon.com",
                    "tom.wang@lanyon.com",
                    "lloyd.lin@lanyon.com",
                    "fiona.wu@lanyon.com",
                    "yvette.yao@lanyon.com"
                ]
            },
            {
                "name": "SC2 Team",
                "rapidViewID": 44,
                "members": [
                    "tony.zhang@lanyon.com",
                    "daniel.liu@lanyon.com",
                    "anthony.zhang@lanyon.com",
                    "yeast.wu@lanyon.com",
                    "grace.zhou@lanyon.com",
                    "karen.yuan@lanyon.com",
                    "kevin.dong@lanyon.com"
                ]
            },
            {
                "name": "SC4 Team",
                "rapidViewID": 46,
                "members": [
                    "apple.yin@lanyon.com",
                    "gary.liu@lanyon.com",
                    "tao.wu@lanyon.com",
                    "ricky.cai@lanyon.com",
                    "shine.sheng@lanyon.com",
                    "sabrina.zhu@lanyon.com"
                ]
            },
            {
                "name": "SC5 Team",
                "rapidViewID": 47,
                "members": [
                    "thomas.yang@lanyon.com",
                    "lyle.zheng@lanyon.com",
                    "shawn.guan@lanyon.com",
                    "bruce.fan@lanyon.com",
                    "luo.ke@lanyon.com",
                    "helen.yuan@lanyon.com"
                ]
            },
            {
                "name": "MKV Team",
                "rapidViewID": 40,
                "members": [
                    "winton.wu@lanyon.com",
                    "mary.gao@lanyon.com",
                    "will.wu@lanyon.com",
                    "andrew.liu@lanyon.com",
                    "jenny.wu@lanyon.com",
                ]
            },
            {
                "name": "Reporting Team",
                "rapidViewID": 39,
                "members": [
                    "jacob.zhang@lanyon.com",
                    "bob.liu@lanyon.com",
                    "tracy.su@lanyon.com",
                    "cindy.rui@lanyon.com",
                    "carter.wu@lanyon.com",
                    "jay.ruan@lanyon.com"
                ]
            }
        ]
    });
};
