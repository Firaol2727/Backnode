const {sequelize}=require('../models');
const express=require('express')
const bcrypt=require('bcrypt')
const jwt =require('jsonwebtoken')
const router=require('express').Router();
const multer =require('multer');
const upload=multer({storage:multer.memoryStorage()})
var cookieParser = require('cookie-parser');
const bodyParser=require('body-parser');
const { checkout } = require('./sellerRoutes');
var jsonParser=bodyParser.json();

router.use(jsonParser);
const{Admin,Cart,Category,Customer,Orders,Pictures,Product,Seller,Broadcategory}=sequelize.models;
const authorize=async(req,res,next)=>{
    let {phonenumber,password}=req.body;
    console.log(phonenumber,password);
    return Admin.findOne(
        {
            where: {
            phonenumber:phonenumber,
        },
        attributes:['Aid','password']
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
                find.uid=data.Aid;
                find.allow=true;
            }
            return find;
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
        res.cookie("jwt",accessToken,{httpOnly:true});
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
const checkAuthorization =async(req,res,next)=>{
    if(req.cookies.jwt){
        const token=req.cookies.jwt;
        if(token==null){
            res.status(400).send("not logged in")
        }
        jwt.verify(
            token,process.env.ACCESS_TOKEN_SECRET,
            (err,user)=>{
                if(err){
                    res.send(err).status(404);
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
            token,process.env.ACCESS_TOKEN_SECRET,
            (err,user)=>{
                if(err){
                    console.log("error verify")
                    res.sendStatus(403);
                }
                req.user=user;
                next();
            }
        )
    }
    else{
        console.log("Some other error")
        res.sendStatus(403);
    }
}
router.post('/login',authorize,(req,res)=>{
    res.sendStatus(200);
})
router.post('/changepp',checkAuthorization,async(req,res)=>{
    let {adfname, adlname, adtelphone,telUsername}=req.body;
    console.log(adfname, adlname, adtelphone,telUsername)
    let uid=req.user;
    return Admin.update({
        aFname:adfname,
        aLname:adlname,
        phonenumber:adtelphone,
        telUsername:telUsername,
    },{
        where:{Aid:uid}
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
router.post('/changepassword',checkAuthorization,async(req,res)=>{
    let {pp, np, cp}=req.body;
    let uid=req.user;
    if(np==cp){
        return Admin.findOne({
            attributes:[
                "password"
            ],
            where:{Aid:uid}
        })
        .then(async (data)=>{
            const check=await bcrypt.compare(pp,data.password);
            if(check){  
                const hash = await bcrypt.hashSync(np, bcrypt.genSaltSync(10));
                return Admin.update({
                    password:hash
                },{
                    where:{Aid:uid}
                })
            }else{
                res.sendStatus(500);
            }
        })
        .then((data)=>{
            if(data){
                res.sendStatus(200);
            }
        })
        .catch((err)=>{
            console.log(err);
            res.sendStatus(500);
        })
    
    }


})
router.post('/addseller',checkAuthorization,async(req,res)=>{
    console.log(req.body);
    let {managerFname, manageLname, companyName, phoneNo,
        region, city, password,Stream,location,subcity
    }=req.body;
    const hash = await bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    console.log(hash);
    return Seller.create({
        sid:"",
        managerFname:managerFname,
        manageLname:manageLname,
        companyName:companyName,
        phoneNo:phoneNo,
        region:region,
        Stream:Stream,
        city:city,
        subcity:subcity,
        slocation:location,
        password:hash
    })
    .then(data=>{
        if(data){
            console.log(data);
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
router.post('/addbroudcategories',checkAuthorization,(req,res)=>{
    let {name}=req.body;
    return Broadcategory.create({
        pid:"",
        name:name
    }).then(data=>{
        if(data){
            console.log(data);
            res.sendStatus(200);
        }
    }).catch(err=>{
        console.log(err);
        res.sendStatus(500);
    })
})
router.post('/addcategories',checkAuthorization,(req,res)=>{
    let {subcat,bcat}=req.body;
     
    Broadcategory.findOne({
        where:{name:bcat}
    }).then((data)=>{
        if(data){
            return Category.create({
                cid:"",
                cname:subcat,
                BroadcategoryPid:data.pid

            })
        }
        else{
            throw Error("no broadcategory");
        }
        
    })
    .then(data=>{
        if(data){
            console.log(data);
            res.sendStatus(200);
        }
    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(500);
    })
})

router.get('/sellers',checkAuthorization,(req,res)=>{
    return Seller.findAll()
    .then((data)=>{
        res.send(data);
    })
})
router.get('/categories',checkAuthorization,(req,res)=>{
    return Broadcategory.findAll({
        attributes:["pid","name"],
        include:[Category
        ]
    })
    .then((data)=>{
        res.send(data);
    })
})
router.get('/subcategories',checkAuthorization,(req,res)=>{
    return Broadcategory.findAll({
        attributes:["pid","name"],
        include:[Category
        ]
    })
    .then((data)=>{
        res.send(data);
    })
})
router.post('/deleteseller',checkAuthorization,async(req,res)=>{
    let sid=req.body.sid;
    console.log(req.body);
    if(sid){
        Seller.destroy({
        where:{
            sid:sid
        }
    }).then(data=>{
        res.sendStatus(200)
    }).catch(err=>{
       res.sendStatus(400)
    })
    }else{
        res.sendStatus(400)
    }

    
    
})
router.post('/deleteorder',(req,res)=>{
    console.log(req.body);
    let oid=req.body.oid;
    return Orders.destroy({
        where:{oid:oid,delivered:false}
    }).then(data=>{
        res.sendStatus(200);
    }).catch(err=>{
        console.log("The error is ",err);
    })
})
router.post('/orderdelivered',(req,res)=>{
    let oid=req.body.oid;
    console.log("ordered delivered",oid);
    return Orders.update({
        delivered:true,
    },{
        where:{oid:oid},
    }).then((data)=>{
        res.sendStatus(200);
    }).catch((err)=>{
        res.sendStatus(400);
    })
})
router.post('/editorder',checkAuthorization,(req,res)=>{
    console.log(req.body);
    let oid=req.body.oid;
    let amount=req.body.amount?req.body.amount:1;
    let odescription=req.body.odescription;
    let deliveryfee=req.body.deliveryfee;
    return Orders.findOne({
        where:{oid:oid,delivered:false}
    }).then((data)=>{
        if(data){
            // console.log(data);
            let totalprice=(amount*data.totalPrice)+parseFloat(deliveryfee);
            console.log("the total amount is ",totalprice);
        return Orders.update({
            amount:amount,
            totalPrice:totalprice,
            odescription:odescription,
            deliveryfee:deliveryfee
        },{
            where:{
                oid:oid,
            }
        })
        }
        else return ;
    })
    .then(data=>{
        // console.log(data);
        res.sendStatus(200);
    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(500);
    })
})

router.get('/watchorder',checkAuthorization,(req,res)=>{
    console.log("fetching order ")
    return Orders.findAll(
        {
            where:{delivered:false},
            include:[{
                model:Product,
                attributes:{exclude:["createdAt","updatedAt","picpath","CategoryCid","marketprice"]}
            },{
                model:Customer,
                attributes:{exclude:["createdAt","updatedAt","picpath","password"]}
            }
            ,{
                model:Seller,
                attributes:{exclude:["createdAt","updatedAt","password"]}
            }]
        }
    )
    .then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.sendStatus(500);
    })
})
router.get("/sold",checkAuthorization,(req,res)=>{
    console.log("fetching sold ")
    return Orders.findAll(
        {
            where:{delivered:true},
            include:[{
                model:Product,
                attributes:{exclude:["createdAt","updatedAt","picpath","CategoryCid","marketprice"]}
            },{
                model:Customer,
                attributes:{exclude:["createdAt","updatedAt","picpath","password"]}
            }
            ,{
                model:Seller,
                attributes:{exclude:["createdAt","updatedAt","password"]}
            }]
        }
    )
    .then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.sendStatus(500);
    })
})
router.get("/watchorder/:id",(req,res)=>{
    let id =req.params.id;
    console.log("fetching order ")
    return Orders.findOne(
        {
            where:{oid:id},
            include:[{
                model:Product,
                attributes:{exclude:["createdAt","updatedAt","picpath","CategoryCid","marketprice"]}
            },{
                model:Customer,
                attributes:{exclude:["createdAt","updatedAt","picpath","password"]}
            }
            ,{
                model:Seller,
                attributes:{exclude:["createdAt","updatedAt","password"]}
            }]
        }
    )
    .then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.sendStatus(500);
    })
})
router.get('/getprofilea',checkAuthorization,(req,res)=>{
    let aid=req.user;
    return Admin.findOne(
        {
            attributes: {exclude: ['password'] },
            where:{Aid:aid}
        }
    )
    .then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.sendStatus(500);
    })
})

module.exports=router;