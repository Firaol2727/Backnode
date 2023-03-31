'use strict';
const {
  Model
} = require('sequelize');
const bcrypt =require('bcrypt');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    static associate({Product}) {
      Seller.hasMany(Product,{onDelete:"CASCADE"})
    }
  }
  Seller.init({
    sid:{
      set(value) {
        let x=uid(16);
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue('sid', x);
      },
      type:DataTypes.STRING,
      primaryKey:true
    },
    managerFname:{
      type: DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('managerFname', vowel);
      },
    },
    manageLname:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('manageLname', vowel);
      },
    },
    companyName:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('companyName', vowel);
      },
      unique:true
    },
    phoneNo:{
      type:DataTypes.STRING,
      allowNull:false
    },
    region:{
      type:DataTypes.STRING,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('region', vowel);
      },
      allowNull:false
    },
    Stream:{
      type:DataTypes.STRING,
      allowNull:false
    },
    city:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('city', vowel);
      },
    },
    subcity:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('subcity', vowel);
      },
    },
    slocation:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('slocation', vowel);
      },
    },
    password:{
      type:DataTypes.TEXT,
      allowNull:false,
      
    }
  }, {
    sequelize,
    modelName: 'Seller',
  });
  return Seller;
};