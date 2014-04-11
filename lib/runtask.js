/*
Module Dependencies
 */

require('../app/models/item');
var fs = require('fs'),
  config = require('config'),
  EventRegister = require('./event_register').register,
  mongoose = require('mongoose'),
  Item = mongoose.model('Item'),
  util = require('util'),
  path = require('path');

var command = process.argv[2],
    filename = process.argv[3];

console.log('Environment %s: ', process.env.NODE_ENV);

mongoose.connection.on('connected', function(){
  switch(command){
    case 'stock':
      import_stock();
    break;
    default:
      console.log('Usage: node runtask --option --filename');
      process.exit(1);
    break;
  }
});

function import_stock(){
  // Make sure we got a filename on the command line.
  if (process.argv.length < 4) {
    console.log('Usage: node ' + process.argv[1] + '  --option --filename');
    process.exit(1);
  }


  var register = new EventRegister();

  register.once('collectFile', function(data, isDone){
    // Read the file and print its contents.
    var fs = require('fs'), 
        filename = process.argv[3],
        assets_path = path.resolve('..', 'assets');

    fs.readFile(assets_path + '/' + filename, 'utf8', function(err, data) {
      if (err){
        isDone(err);
      }else{
        isDone(JSON.parse(data));
      }
    
    });    
  });

  register.on('createItem', function(data, isDone){
    var item = new Item();
    item.itemName = data.itemName;
    item.nafdacRegNo = data.nafdacRegNo;
    item.itemBoilingPoint = 0;
    item.save(function(err, i){
      if(err){
        isDone(err);
      }else{
        isDone(true);
      }
    });
  });

  register.once('insertRecords', function(data, isDone, self){
    console.log('Inserting %s records', data.length);
    self.until(data, ['createItem'], function(r, count){
      isDone(count);
    });
  });

  register
  .queue('collectFile', 'insertRecords')
  .onError(function(err){
    throw err;
  })
  .onEnd(function(r){
    console.log('Stock Import Complete');
    console.log(r + ' records imported');
    process.exit(0);
  })
  .start({});
}

//mongoimport -d stoccloud -c govtfacility --type csv --file assets/lagos-state.csv --headerline


console.log(process.argv);