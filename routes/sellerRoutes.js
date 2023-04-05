const {sequelize}=require('../models');
const jwt =require('jsonwebtoken');
const bcrypt=require("bcrypt");
const router=require('express').Router();
const fs=require('fs');
var bodyParser = require('body-parser');
const{Category,Pictures,Product,Seller}=sequelize.models;
const authorizeSeller=async(req,res,next)=>{
    let {phonenumber,password}=req.body;
    return Seller.findOne(
        {
            where: {
                phoneNo:phonenumber,
        },
        attributes:['sid','password']
        }
    ).then(async(data)=>{
        // console.log("the data is ",data.Aid,data.password);
        const find={
            allow:false,
            uid:null
        }
        if (data) {
            const hashed=data.password;
            const compared=await bcrypt.compare(password,hashed);
            if(compared){
                console.log("correct password")
                find.uid=data.sid;
                find.allow=true;
                return find;
            }else{
                console.log("Invalid  password")
                return find;
            }
        }
        else{
            return find;
        }
    }).then(async (find)=>{
        console.log("the find is ",find);
    if(find.allow)
    {  
        const user=find.uid;
        const accessToken=await jwt.sign(user,
            process.env.ACCESS_TOKEN_SECRET);
        console.log("accessToken",accessToken);
        res.cookie("u",accessToken,{maxAge: 7200000,httpOnly:true});
        next();
    }
    else {
        console.log(find);
        res.status(400).send("error username or password");
    }
    })
    .catch((err)=>{
        console.log("The error occures is  " +err);
        res.sendStatus(500);
    })
}
const checkAuthorizationSeller=async(req,res,next)=>{
    if(req.cookies.u){
        const token=req.cookies.u;
        if(token==null){
            res.status(400).send("not logged in")
        }
        jwt.verify(
            token,process.env.ACCESS_TOKEN_SECRET,
            (err,user)=>{
                if(err){
                    res.sendStatus(404);
                }
                req.user=user;
                next();
            }
        )
    }
    else if(req.headers.cookies){
        let contentincookie=req.headers.cookies;
        const token=contentincookie.slice(2);
        jwt.verify(
            token,process.env.REFRESH_TOKEN_SECRET,
            (err,user)=>{
                if(err){
                    res.sendStatus(403);
                }
                req.user=user;
                next();
            }
        )
    }
}
let filname;
const multer =require('multer');
const path=require("path");
var jsonParser = bodyParser.json();

const Deletefiles = require('../deletefile');
const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
            cb(null,'./dbImages')
    }
    ,filename:(req,file,cb)=>{
        filname=Date.now()+ Math.round(Math.random()*1000)+ path.extname(file.originalname) ;
        cb(null,filname)
    }
})
const multerFilter=(req,file,cb)=>{
    if(file.mimetype=="image/png"|| file.mimetype=="image/jpg"|| file.mimetype=="image/jpeg" ){
        cb(null,true);
    }else{
         return cb(new Error("type error"),false);
    }
       
}
const upload=multer({
    storage:storage,
    fileFilter:multerFilter,
    
}).fields([
    {name:"image",maxCount:7}
]);
router.use(jsonParser);
router.post("/login",authorizeSeller,(req,res)=>{
    res.sendStatus(200);
})
router.get('/logout',(req,res)=>{
    console.log("logouting")
    res.cookie('a', 'none', {maxAge: 720000,httpOnly:true }).sendStatus(200)
})
router.post('/upload',checkAuthorizationSeller,async (req,res)=>{
    upload(req,res,function (err) {
        // console.log(err);
    if(err instanceof multer.MulterError){
        console.log("error occured");
        console.log(err);
        res.send("error file type");
    }
    else if(err){
        console.log("we are in this this shit");
        res.send(err);
    }
        const savedfiles=req.files;
        // console.log("body",req.body);
        // console.log("saved",savedfiles)
        let uid=req.user;
        let {pname,marketprice,price,category,description}=req.body;
        category=Number(category);
        price=Number(price);
        marketprice=Number(marketprice);
        let picturess=[];
        let pid=0;
        let letmeSee=savedfiles.image[0].filename;
        console.log(picturess)
        let letid;
        return Product.create({
            pid:"",
            pname:pname,
            price:price,
            marketprice:marketprice,
            description:description,
            CategoryCid:category,
            SellerSid:uid,
            letmeSee:0
        }).then(data=>{
                let pid=data.pid;
                letid=pid;
                let picturess=[];
                savedfiles.image.map((item)=>{
                    picturess.push({
                        "id":"",
                        "picpath":item.filename,
                        "type":"image",
                        "ProductPid":pid
                    })
                })
                return  Pictures.bulkCreate(picturess)
        }).then(async data=>{
            await Product.update({
                letmeSee:data[0].id
            },{where:{
                pid:letid
            }})
            res.status(200).send(' <div style="color:red; position:absolute;left:20%;top:20%;width:50%;height:50%"> <h1> SuccessFull Upload <h1>  <hr>  <a href="http://localhost:3000/selhome"> back<a/> </div> ')
        }).catch(err=>{
            console.log(err);
            res.sendStatus(500);
        }) 

    }
    )
}) 
router.post('/editproduct',checkAuthorizationSeller,(req,res)=>{
    const {pname,price,marketprice,description,ffid}=req.body;
    console.log(req.body);
    return Product.update({ 
        pname,price,marketprice,description
    },{
        where:{pid:ffid}
    }).then(data=>{
        if(data){ 
            res.sendStatus(200);
        }else{
            res.sendStatus(404)
        }
    }).catch(err=>{
            res.sendStatus(500)
    })
})
router.get('/myproductt',checkAuthorizationSeller,(req,res)=>{
    console.log("getting product")
    const uid=req.user;
    return Product.findAll(
        {
            where:{SellerSid:uid},
            include:[Pictures]

        }
    ).then((data)=>{
        res.send(data);
    })
})
router.get('/product/:pid',checkAuthorizationSeller,(req,res)=>{
   let pid=req.params.pid;
   return Product.findOne({
    where:{pid:pid},
    include:[Pictures]
   }).then((data)=>{
       if(data){
            let response=data.toJSON();
            // console.log(response);
            res.status(200).send(response);
       }else{
        res.status(404).send("not found");
       }
   }).catch((err)=>{
    console.log(err);
    res.sendStatus(500);
   })
})
router.get('/subcategories',(req,res)=>{
    return Category.findAll()
    .then((data)=>{
        // console.log(data)
        res.send(data);
    })
})
router.post('/changepp',checkAuthorizationSeller,async(req,res)=>{
    let {managerFname, managerLname, phoneNo,city,companyName}=req.body;
    // console.log(req.body)
    let uid=req.user;
    console.log(uid)
    return Seller.update({
        managerFname:managerFname,
        managerLname:managerLname,
        phoneNo:phoneNo,
        companyName:companyName,
        city:city,
    },{
        where:{sid:uid}
    })
    .then(data=>{
        if(data){
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }
    })
    .catch((err)=>{
        console.log(err);
        res.sendStatus(500);
    })

})
router.post('/changepassword',checkAuthorizationSeller,async(req,res)=>{
    let {pp, np, cp}=req.body;
    let uid=req.user;
    console.log(req.body)
    if(np==cp){
        return Seller.findOne({
            attributes:[
                "password"
            ],
            where:{sid:uid}
        })
        .then(async (data)=>{
            const check=await bcrypt.compare(pp,data.password);
            if(check){  
                console.log("true")
                const hash = await bcrypt.hashSync(np, bcrypt.genSaltSync(10));
                return Seller.update({
                    password:hash
                },{
                    where:{sid:uid}
                }).then((data)=>{
                    console.log("succesful update")
                    if(data){
                        res.sendStatus(200);
                    }
                })
            }else{
                console.log("false")
                res.sendStatus(500);
            }
        })
        .catch((err)=>{
            console.log(err);
            res.sendStatus(500);
        })
    
    }


})
router.get('/getprofile',checkAuthorizationSeller,(req,res)=>{
    let uid=req.user
    return Seller.findOne(
        {
            attributes: {exclude: ['password'] },
            where:{sid:uid}
        }
    )
    .then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.sendStatus(500);
    })
})
router.post('/deleteproduct',checkAuthorizationSeller,async(req,res)=>{
    let {id}=req.body;
    console.log("deleting")
    return Pictures.findAll({
        where:{ProductPid:id}
    }).then(async data=>{
        const pics=[...data];
        // console.log("array",pics)
        let i=0;
        pics.map(async pic=>{
            console.log(i)
            i++;
            await Deletefiles(pic);
        })
    })
    .then((data)=>{
        console.log(data);
        return Pictures.destroy({
            where:{ProductPid:id}
        })
    })
    .then((data)=>{
        return Product.destroy({
            where:{pid:id}
        })
    })
    .then((data)=>{
        console.log(data);
        res.sendStatus(200);
    }). catch(err=>{
        console.log(err);
        res.sendStatus(500);
    })
})
module.exports=router;
