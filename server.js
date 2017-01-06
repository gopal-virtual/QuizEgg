var express = require('express');
var multer = require('multer');
var app = express();
var fs = require("fs");
var async = require('async');
var zip = require('express-zip');
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/uploads'));
// private
app.post('/add/module', addModule);
app.put('/add/soundmodule', addSoundModule);
// public
app.get('/download', downloadFile);
app.delete('/delete/sound', deleteSound);
app.get('/get/json', getJson);
app.post('/add/file', uploadFile);
app.put('/add/langaudio', addLangAudio);
app.get('/', home);

var server = app.listen(3000, 'localhost', function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})

function home(req,res){
      res.sendFile(__dirname + "/index.html");
}
function deleteSound (req, res){
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        soundData = JSON.parse(jsonString);
        var file = "./db/"+soundData.module+".json";
        fs.readFile(file, 'utf8', function(err, data) {
            data = JSON.parse(data);
            var filePath = "./uploads/"+ data[soundData.module][soundData.audio]["lang"][soundData.lang];
            delete data[soundData.module][soundData.audio]["lang"][soundData.lang];
            console.log(data)
            fs.writeFile(file, JSON.stringify(data), 'utf8', function(err) {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'text/json'});
                    return res.end(JSON.stringify({"error" : err}));
                }
                else{
                    fs.unlink(filePath, (err) => {
                      if (err) throw err;
                      console.log('successfully deleted'+filePath);
                      res.writeHead(204);
                      return res.end();
                    });
                }
            })
        });
    });
}
function addSoundModule (req, res) {
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        soundData = JSON.parse(jsonString);
        var file = "./db/"+soundData.module+".json";
        fs.readFile(file, 'utf8', function(err, data) {
            data = JSON.parse(data);
            for(var sound in soundData.soundModule){
                if(!data[soundData.module][sound]){
                    data[soundData.module][sound] = soundData.soundModule[sound];
                }
                else{
                    res.writeHead(409, {'Content-Type': 'text/json'});
                    res.end(JSON.stringify({"Conflict" : "Sound key already exists"}));
                    return;
                }
            }
            console.log(data)
            fs.writeFile(file, JSON.stringify(data), 'utf8', function(err) {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'text/json'});
                    res.end(JSON.stringify({"error" : err}));
                    return;
                }
                else{
                    res.writeHead(201, {'Content-Type': 'text/json'});
                    res.end(JSON.stringify(data));
                    return;
                }
            })
        });
    });
}
function addLangAudio(req, res) {
    // get module name, audio key, language key from request
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        audioData = JSON.parse(jsonString);
        var file = "./db/"+audioData.module+".json";
        fs.readFile(file, 'utf8', function(err, data) {
            data = JSON.parse(data);
            data[audioData.module][audioData.audio]['lang'][audioData.language] = audioData.filename;
            fs.writeFile(file, JSON.stringify(data), 'utf8', function(err) {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'text/json'});
                    res.end(JSON.stringify({"error" : err}));
                    return;
                }
                else{
                    res.writeHead(201, {'Content-Type': 'text/json'});
                    res.end(JSON.stringify(data));
                    return;
                }
            })
        });
    });
}
function addModule(req, res) {
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
                    console.log('creating : ',audioData)
                    if (err) {
                        if (err.code === "EEXIST") {
                            res.writeHead(409, {'Content-Type': 'text/json'});
                            res.end(JSON.stringify({'Conflict' : 'The file already exists'}));
                            return;
                        } else {
                            throw err;
                            return;
                        }
                    }
                    fs.write(fd, JSON.stringify(audioData), function(err) {
                        if(err) {
                            res.writeHead(400, {'Content-Type': 'text/json'});
                            res.end(JSON.stringify({"error" : err}));
                            return;
                        }
                        else{
                            res.writeHead(201, {'Content-Type': 'text/json'});
                            res.end(JSON.stringify(audioData));
                            return;
                        }
                    });
                    fs.close(fd, function(err) {
                        // handle error
                    });
                });
            }
        }
    });
}
function uploadFile(req,res){
    upload(req,res,function(err) {
        if(err) {
            res.writeHead(400, {'Content-Type': 'text/json'});
            return res.end({"error":"Error uploading file."});
        }
        // file details to be used after upload
        res.writeHead(201, {'Content-Type': 'text/json'});
        res.end(JSON.stringify(req.file));
        return;
    });
}
function getJson(req, res) {
    var dir = './db/';
    readAllFile(dir, res);
}

function downloadFile(req, res) {
  var dir = './uploads/';
  var data = [];
  fs.readdir(dir, (err, files) => {
      files.forEach(file => {
          data.push({"path" : dir + file, "name" : file})
      })
      res.zip(data);
  })
}
// read file
function readAllFile(dir, response) {

  var data = {};
  fs.readdir(dir, (err, files) => {
      async.eachSeries(
          files,
          function(filename, cb) {
              fs.readFile(dir+filename, function(err, content) {
                  if (!err) {
                      var filecontent = JSON.parse(content);
                      for(key in filecontent){
                          if(filecontent.hasOwnProperty(key)){
                              data[key] = filecontent[key]
                          }
                      }
                  }
                  cb(err);
              });
          },
          function(err) {
              if(err){
                  response.writeHead(400, {'Content-Type': 'text/json'});
                  return response.end(JSON.stringify({"error":err}))
              }
              else{
                  response.writeHead(200, {"Content-Type": "text/json"});
                  response.end(JSON.stringify(data))
              }
          }
      )
  })
}
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('audioFile');
