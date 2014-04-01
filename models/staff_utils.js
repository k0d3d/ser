var Staff = require('./organization/staff.js'),
    Distributor = require('./organization/distributor.js'),
    Manager = require('./organization/manager.js'),
    Hospital = require('./organization/hospital.js'),
    PharmaComp = require('./organization/pharmacomp.js');

module.exports = {
    /**
     * fetches the model to be queried using the related account level / type.
     * @param  {[type]} account_type [description]
     * @return {[type]}              [description]
     */
    getMeMyModel : function getMeMyModel (account_type) {
      account_type = parseInt(account_type);
      if (account_type === 4) {
        return Staff;
      }  

      if (account_type === 0) {
        return PharmaComp;
      }

      if (account_type === 3) {
        return Manager;
      }
      if (account_type === 1) {
        return Manager;
      }
      if (account_type === 2) {
        return Distributor;
      }
      if (account_type === 5) {
        return Hospital;
      }

      return Manager;

    }
  };
