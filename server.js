var express = require('express');
var app = express();
var fs = require("fs");
var async = require('async');

// app.post('/addUser', function (req, res) {
//    var jsonString = '';
//
//     req.on('data', function (data) {
//         jsonString += data;
//     });
//
//     req.on('end', function () {
//         fs.readFile( __dirname + "/" + "localisation.json", 'utf8', function (err, data) {
//             data = JSON.parse( data );
//             data["user5"] = JSON.parse(jsonString);
//             console.log( data );
//             res.end(JSON.stringify(data));
//         });
//     });
// })

// app.delete('/deleteUser', function (req, res) {
//    fs.readFile( __dirname + "/" + "localisation.json", 'utf8', function (err, data) {
//        data = JSON.parse( data );
//        delete data["user" + req.query.id];
//
//        console.log( data );
//        res.end( JSON.stringify(data));
//    });
// })

// app.get('user/:id', function (req, res) {
//    // First read existing localisation.
//    fs.readFile( __dirname + "/" + "localisation.json", 'utf8', function (err, data) {
//        localisation = JSON.parse( data );
//        var user = localisation["user" + req.params.id]
//        console.log( user );
//        res.end( JSON.stringify(user));
//    });
// })

app.get('/get/json', function(req, res) {
    var dir = './db/';
    var json = [];
    res.writeHead(200, {"Content-Type": "text/json"});
    fs.readdir(dir, (err, files) => {
    //   files.forEach(file => {
        //   fs.readFile(dir + "" +file, 'utf8', function(err, data) {
        //       console.log(data);
        //       json.push(JSON.parse(data))
        //   });
    //   });
    //   res.end(JSON.stringify(json));
        async.eachSeries(
            // Pass items to iterate over
            files,
            // Pass iterator function that is called for each item
            function(filename) {
                fs.readFile(dir+""+filename, function(err, content) {
                    if (!err) {
                        res.write(content);
                    }
                });
            },
            // Final callback after each item has been iterated over.
            function(err) {
                res.end()
            }
        );
    })

})
app.post('/add/module', function(req, res) {
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        audioData = JSON.parse(jsonString);
        for (var module in audioData) {
            if (audioData.hasOwnProperty(module)) {
                fs.open('./db/' + module + '.json', "wx", function(err, fd) {
                    // handle error
                    if (err) {
                        if (err.code === "EEXIST") {
                            console.error('myfile already exists');
                            return;
                        } else {
                            throw err;
                        }
                    }
                    fs.write(fd, JSON.stringify(audioData), function(err) {
                        if(err) {
                            res.end(JSON.stringify({"error" : err}));
                        }
                        else{
                            res.end(JSON.stringify(audioData));
                        }
                    });
                    fs.close(fd, function(err) {
                        // handle error
                    });
                });
            }
        }
    });
})
app.put('/update/audio', function(req, res) {
    fs.readFile(__dirname + "/" + "localisation.json", 'utf8', function(err, data) {
        console.log(data);
        res.end(data);
    });
})

var server = app.listen(8081, '127.0.0.1', function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
