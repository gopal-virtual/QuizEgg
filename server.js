var express = require('express');
var multer = require('multer');
var app = express();
var fs = require("fs");
var async = require('async');
var zip = require('express-zip');
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/client'));
// download zip
app.get('/download', downloadFile);
app.get('/get/json', getJson);
app.post('/api/file', uploadFile);
app.post('/add/module', addModule);
app.put('/update/audio', updateAudio);
app.get('/', home);

var server = app.listen(3000, 'localhost', function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})

function home(req,res){
      res.sendFile(__dirname + "/index.html");
}

function updateAudio(req, res) {
    // get module name, audio key, language key from request
    var jsonString = '';

    req.on('data', function(data) {
        jsonString += data;
    });

    req.on('end', function() {
        audioData = JSON.parse(jsonString);
        console.log('module',"./db/"+audioData.module+".json");
        var file = "./db/"+audioData.module+".json";
        fs.readFile(file, 'utf8', function(err, data) {
            data = JSON.parse(data);
            data[audioData.module][audioData.audio]['lang'][audioData.language] = audioData.filename;
            fs.writeFile(file, JSON.stringify(data), 'utf8', function(err) {
                if(err) {
                    res.end(JSON.stringify({"error" : err}));
                }
                else{
                    res.end(JSON.stringify(data));
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
}

function uploadFile(req,res){
    upload(req,res,function(err) {
        if(err) {
            console.log("error uploading file : ", err)
            return res.end("Error uploading file.");
        }
        // file details to be used after upload
        console.log(req.file)
        res.end(JSON.stringify(req.file));
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
  response.writeHead(200, {"Content-Type": "text/json"});
  var data = {};
  fs.readdir(dir, (err, files) => {
      console.log(files);
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
              response.end(JSON.stringify(data))
          }
      )
  })
}
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('audioFile');
