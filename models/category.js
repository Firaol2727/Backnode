'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate({Product,Broadcategory}) {
      Category.hasMany(Product);
      Category.belongsTo(Broadcategory);
    }
  }
  Category.init({
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
    cname:{
      type:DataTypes.STRING,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('cname', vowel);
      },
      allowNull:false,
      unique:true
    }
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};