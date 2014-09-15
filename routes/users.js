var express = require('express');
var router = express.Router();

//==========================Variables for Software Repository Polling =============================
//github Node NPM module
//
var github		= require('octonode');

//set up variable to pass as a parameter for git hub
var client = github.client();


// For illustration purposes only -- not used in this application
var ghme        = client.me();
var ghuser      = client.user('pksunkara');
var ghrepo      = client.repo('pksunkara/hub');
var ghorg       = client.org('flatiron');
var ghissue     = client.issue('pksunkara/hub', 37);
var ghmilestone = client.milestone('pksunkara/hub', 37);
var ghlabel     = client.label('pksunkara/hub', 'todo');
var ghpr        = client.pr('pksunkara/hub', 37);
var ghgist      = client.gist();
var ghteam      = client.team(37);

var ghsearch = client.search();

//web app environment- 

var qs			= require('querystring');

// ================================================================================================


/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var parmAdd = req.body;
    var parmAdd1 = JSON.stringify(parmAdd);
    console.log('parmAdd = ' + parmAdd1);
    
    // authentication github parameters (Future) ====================

    var auth_url = github.auth.config({
      id: '9b1036c3ecb757bb49b7',
      secret: 'fcf16988ce5d3dfc879be015bfcc3fda3a5ab967'
    }).login(['pdhoward', 'repo', 'gist']);

    // Store info to verify against CSRF (Future) ============

    var state = auth_url.match(/&state=([0-9a-z]{32})/i);

    //pulse the repository with parameter -- and display json object on the console. 

    var body = '';

    var pulseParm = '/users/' + parmAdd.username;
    console.log('pulseParm = ' + pulseParm);
    
    client.get(pulseParm, {}, function (err, status, jsonbody, headers)
            {
            if (err)
                {
                 res.send((err === null) ? { msg: '' } : { msg: "Outcomes Not Found" });
                 return;
                }
    	    console.log('error = ' + err + 'status = ' + status + 'headers = ' + headers);
            body = jsonbody;
            body.source = 'github';
            console.log(body);
            
            //Record JSON object retrieved from repository on MongoDB

            db.collection('userlist').insert(body, function(err, result)
                    {
                    res.send((err === null) ? { msg: '' } : { msg: err });
                     });
            });
});

/*
 * DELETE to deleteuser.
 */

router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;