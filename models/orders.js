'use strict';
const {
  Model
} = require('sequelize');
const {uid}=require("uid")
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Product,Customer,Seller}) {
      Orders.belongsTo(Seller);
      Orders.belongsTo(Customer);
      Orders.belongsTo(Product)
    }
  }
  Orders.init(
    {
      oid:{
        set(value) {
          let x=uid(16);
          // Storing passwords in plaintext in the database is terrible.
          // Hashing the value with an appropriate cryptographic hash function is better.
          this.setDataValue('oid', x);
        },
        type:DataTypes.STRING,
        primaryKey:true
        
      },
      amount:{
        type:DataTypes.DOUBLE,
        defaultValue:1,
      },
      delivered:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      },
      totalPrice:{
        type:DataTypes.DOUBLE,
        allowNull:false
      },
      deliveryfee:{
        type:DataTypes.DOUBLE,
        defaultValue:0
      },
      odescription:{
        type:DataTypes.TEXT,
        allowNull:true
      }
  
    }, {
      sequelize,
      modelName: 'Orders',
      tableName:"orders"
    });
  return Orders;
};