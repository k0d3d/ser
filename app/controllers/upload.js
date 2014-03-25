var upload = require('express-upload'),
    gm = require("gm").subClass({ imageMagick: true });

// Build an upload instance but don't execute it right now
var resizeToPublic = upload()
    .accept([/image.*/])
    // .gm(function(gm) {
    //     return gm.resize(false, 100);
    // })
    .to(['public', 'images', 'item-images']);

module.exports = function(app) {
    //File upload handler
    app.post('/upload-doc', function (req, res) {

      resizeToPublic.exec(req.files.itemImage, function(err, file) {
        console.log(file);
          if (err) {
              console.log(err);
              res.json(400, false);
          } else {
              res.send(200, file.name);
          }
      });


      
    });  
}