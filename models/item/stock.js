
/**
 * Module dependencies.
 */

 var mongoose = require('mongoose'),
 env = process.env.NODE_ENV || 'development',
 nconf = require('nconf'),
 Schema = mongoose.Schema,

 pureautoinc  = require('mongoose-pureautoinc');


 var StockCountSchema = new Schema({
  item: {type: Schema.ObjectId, ref: 'Item'},
  locationId: {type: Schema.ObjectId, ref: 'Location'},
  locationName: String,
  amount: {type:Number, min: 1},
  lastOrderDate: {type: Date, default: Date.now},
  itemBoilingPoint:{type: Number},
  pendingTransactions:[]
});

 StockCountSchema.statics = {
    /**
     * [getStockAmountbyId description]
     * @param  {[type]}   id       [description]
     * @param  {[type]}   location [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
     getStockAmountbyId: function(id, location, callback){        
      this.findOne({item: id, locationId: location.id}, function(err, i){
        if(err){
          callback(err);
        }else{
          callback(i);
        }
      });
    },

    /**
     * [getStockAmountbyName description]
     * @param  {[type]}   id       [description]
     * @param  {[type]}   location [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
     getStockAmountbyName: function(id, location, callback){        
      this.findOne({item: id, locationName: location.name}, function(err, i){
        if(err){
          callback(err);
        }else{
          callback(i);
        }
      });
    },    
    /**
     * [findItembyLocation gets stock information by location]
     * @param  {[type]}   itemId   [description]
     * @param  {[type]}   location [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
     findStockbyLocation: function(itemId, location, callback){
        //this.findOne({item: itemId, locat})
      },
    /**
    * [fetchStockDownbyId locates all t]
    * @param  {[type]}   locationId       [description]
    * @param  {Function} callback [description]
    * @return {[type]}            [description]
    */
    fetchStockDownRecordbyId: function fetchStockDownRecordbyId (locationId, callback){
      var q = this.find({locationId: locationId});
      q.populate('item','itemName itemID');
      q.sort({date: -1});
      q.lean();
      q.exec(function(err, i){
        if(err){
          callback(eyahrr);
        }else{
          callback(i);
        }
      });
    },
    /**
    * [mainStockCount gets the stock count for any item in the main 'stock up' inventory]
    * @param  {[type]}   id       [description]
    * @param  {Function} callback [description]
    * @return {[type]}            [description]
    */
    mainStockCount: function mainStockCount(id, callback){
      var q = this.findOne({item: id, locationId: nconf.get("app:main_stock_id")});
      q.lean();
      q.exec(function(err, i){
        //Might return null so
        //lets equate that to no stock
        if(i){
          i.amount = i.amount || 0;
          callback(i);
        }else{
          callback({amount: 0});
        }
      });
    }
  };


  mongoose.model('StockCount', StockCountSchema);
