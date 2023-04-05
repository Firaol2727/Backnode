'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate({Customer,Orders,Pictures,Cart,Category,Seller}) {
      // Product.hasMany(Cart)
      Product.hasMany(Orders)
      Product.hasMany(Pictures,{onDelete:"CASCADE"})
      Product.belongsTo(Category)
      Product.belongsTo(Seller,{onDelete:"CASCADE"})
    }
  }
  Product.init({
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
    pname:{
      type:DataTypes.STRING,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('pname', vowel);
      },
      },
    description:{
      type:DataTypes.TEXT,
      allowNull:false,
      set(value) {
        const vowel=value.trim().toLowerCase();
        this.setDataValue('description', vowel);
      },
      },
    price:{
        type:DataTypes.DOUBLE,
        allowNull:false,
        },
    marketprice:{
      type:DataTypes.DOUBLE,
      defaultValue:null
    },
    letmeSee:{
      type:DataTypes.STRING,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};