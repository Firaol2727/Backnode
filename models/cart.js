'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
const product = require('./product');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate({Customer,Product}) {
      Cart.belongsTo(Customer)
      Cart.belongsTo(Product)
    }
  }
  Cart.init({
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
    
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};