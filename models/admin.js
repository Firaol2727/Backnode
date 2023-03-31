
'use strict';
const {uid}=require("uid")
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      
    }
  
  }
  Admin.init({
    Aid: {
      set(value) {
        let x=uid(16);
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue('Aid', x);
      },
      type:DataTypes.STRING,
      primaryKey:true
    },
    aFname: {
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('aFname', vowel);
      },
    },
    phonenumber:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate:{
        isNumeric:true
      }
    },
    aLname: {
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('aLname', vowel);
      },

    },
    telUsername: {
      type:DataTypes.STRING,
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false
    },

  },
   {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};