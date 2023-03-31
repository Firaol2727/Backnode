'use strict';
const {
  Model
} = require('sequelize');
const bcrypt =require('bcrypt');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate({Product,Cart,Orders}) {
      Customer.hasMany(Cart)
    }
  }
  Customer.init({
    cid:{
      set(value) {
        let x=uid(16);
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue('cid', x);
      },
      type:DataTypes.STRING,
      primaryKey:true
    },
    fname:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        console.log("The value is ",value);
        if(value==""){
          this.setDataValue('fname', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('fname', vowel);
        }
        
      },
    },
    lname:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        if(value==""){
          this.setDataValue('lname', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('lname', vowel);
        }
        
      },
    },
    password:{
      type:DataTypes.TEXT,
      allowNull:false
    },
    telUname:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        if(value==""){
          this.setDataValue('telUname', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('telUname', vowel);
        }
        
      },
    },
    email:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        if(value==""){
          this.setDataValue('email', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('email', vowel);
        }
        
      },
    },
    phone:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        if(value==""){
          this.setDataValue('phone', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('phone', vowel);
        }
        
      },
    },
    region:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        if(value==""){
          this.setDataValue('region', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('region', vowel);
        }
        
      },
      
    },
    city:{
      type:DataTypes.STRING,
      allowNull:true,
      set(value) {
        if(value==""){
          this.setDataValue('city', value)
        }else{
          const vowel=value.trim().toLowerCase();
        this.setDataValue('city', vowel);
        }
        
      },
    },
  }, 
  {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};