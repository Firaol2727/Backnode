'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Pictures extends Model {
    static associate({Product}) {
      Pictures.belongsTo(Product,{onDelete:"CASCADE"})
    }
  }
  Pictures.init({
    id: {
      set(value) {
        if(value==''){
          let x=uid(16);
          // Storing passwords in plaintext in the database is terrible.
          // Hashing the value with an appropriate cryptographic hash function is better.
          this.setDataValue('id', x);
        }else{
            this.setDataValue('id', value);
        }
        
      },
      type:DataTypes.STRING,
      primaryKey:true
    },
    picpath:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    type:{
      type:DataTypes.STRING,
      defaultValue:"image",
    }
  }, {
    sequelize,
    modelName: 'Pictures',
  });
  return Pictures;
};