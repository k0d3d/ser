var easyimg = require('easyimage');



module.exports = function(app) {
    //File upload handler
    app.post('/upload/doc', function (req, res) {
      easyimg.rescrop(
        {
           src: process.cwd() + '/public/images/item-images/' + req.files.itemImage.name, dst: process.cwd() + '/public/images/item-images/thumb-' + req.files.itemImage.name,
           width:250, height:250,
           cropwidth:200, cropheight:200,
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
           width:250, height:250,
           cropwidth:200, cropheight:200,
           x:0, y:0
           },
        function(err) {
           if (err) throw err;
            return res.json(200, req.files.profileImage.name);
        }
      );       
    });  
};