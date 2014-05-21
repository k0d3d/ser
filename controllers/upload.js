var easyimg = require('easyimage'),
    gm = require("gm").subClass({ imageMagick: true });



module.exports = function(app) {
    //File upload handler
    app.post('/upload/doc', function (req, res) {
      easyimg.rescrop(
        {
           src:'/public/images/item-images/' + req.files.itemImage.name, dst:'/public/images/item-images/thumb-' + req.files.itemImage.name,
           width:500, height:500,
           cropwidth:128, cropheight:128,
           x:0, y:0
           },
        function(err) {
           if (err) throw err;
            return res.json(200, req.files.itemImage.name);
        }
      );      
    });

    //File upload handler
    app.post('/upload/profile', function (req, res) {
      easyimg.rescrop(
        {
           src: process.cwd() + '/public/images/profile-images/' + req.files.profileImage.name, dst: process.cwd() + '/public/images/profile-images/thumb-' + req.files.profileImage.name,
           width:500, height:500,
           cropwidth:128, cropheight:128,
           x:0, y:0
           },
        function(err) {
           if (err) throw err;
            return res.json(200, req.files.profileImage.name);
        }
      );       
    });  
};