'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Broadcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Category}) {
      // define association here
      Broadcategory.hasMany(Category);
    }
  }
  Broadcategory.init({
    pid:{
      set(value) {
        let x=uid(16);
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue('pid', x);
      },
      type:DataTypes.STRING,
      primaryKey:true,
    
    },
    name: {
      type:DataTypes.STRING,
      unique:true,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('name', vowel);
      },
    },
   
  }, {
    sequelize,
    modelName: 'Broadcategory',
  });
  return Broadcategory;
};