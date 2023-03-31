const fs=require('fs');
const Deletefiles =async (pics) => {
    const deleted=false;
    // console.log("deleted pics",pics);
        console.log("picpath - ",pics.picpath)
        try{
            fs.unlink(__dirname+"/dbImages/"+pics.picpath, (err) => {
                console.log("Delete File successfully.");
                return true;
            })
        }
        catch(err){
            console.log(err);
            return false;
        }
    return true;
     
}
module.exports= Deletefiles;

/**
 {
  "development": {
    "username": "root",
    "password": "Firaol@$347",
    "database": "harena",
    "host": "127.0.0.1",
    "dialect": "mysql"
   
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
   
  }
}

 */