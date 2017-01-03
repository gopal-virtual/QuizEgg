var express = require('express');
var multer = require('multer');
var app = express();
var fs = require("fs");
var async = require('async');
// read file
app.get('/get/json', function(req, res) {
    var dir = './db/';
    readAllFile(dir, res);
})
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
// end read file
//upload code
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/file',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        // file details to be used after upload
        console.log(req.file)
        res.end("File is uploaded");
    });
});
//upload end
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

var server = app.listen(3000, 'localhost', function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
