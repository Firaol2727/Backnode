const {sequelize}=require('../models');
const jwt =require('jsonwebtoken')
const router=require('express').Router();
const bcrypt=require('bcrypt');
const{Admin,Cart,Category,Customer,Orders,Pictures,Product,Seller,Broadcategory}=sequelize.models;
const authorizeCustomer=async(req,res,next)=>{
    let {phonenumber,password}=req.body;
    console.log(phonenumber,password);
    console.log(req.body);
    if(phonenumber==null||password==null){
        return ;
    }
    return Customer.findOne(
        {
            where: {
            phone:phonenumber,
        },
        attributes:['cid','password']
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
                find.uid=data.cid;
                find.allow=true;
                return find;
            }else{
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
            process.env.REFRESH_TOKEN_SECRET);
        // console.log("accessToken",accessToken);
        res.cookie(
            "cid",accessToken,
            { httpOnly:true,secure:true,sameSite:"none"

            });
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
const checkAuthorizationCustomer =async(req,res,next)=>{

    if(req.cookies.cid){
        console.log("cookies not header",req.headers)
        const token=req.cookies.u;
        if(token==null){
            console.log("null token")
            res.sendStatus(400);
        }
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
    else if(req.headers.cookies){
        console.log(" header",req.headers)
        let contentincookie=req.headers.cookies;
        const token=contentincookie.slice(4);
        jwt.verify(
            token,process.env.REFRESH_TOKEN_SECRET,
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
/// Logining in as A customer 
router.post('/login',authorizeCustomer, (req,res)=>{
    res.sendStatus(200);
})
router.post('/loginmobile',(req,res)=>{
    let {phonenumber,password}=req.body;
    console.log(phonenumber,password);
    console.log(req.body);
    if(phonenumber==null||password==null){
        res.sendStatus(404) ;
    }
    return Customer.findOne(
        {
            where: {
            phone:phonenumber,
        },
        attributes:['cid','password']
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
                find.uid=data.cid;
                find.allow=true;
                return find;
            }else{
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
            process.env.REFRESH_TOKEN_SECRET);
        // console.log("accessToken",accessToken);
        res.send({"u":accessToken});
    }
    else {
        console.log(find);
        res.status(400).send("error username or password");
    }
    })
})
router.get('/logout',(req,res)=>{
    res.clearCookie('jwt');
    res.sendStatus(200);
})
router.get('/getprofile',checkAuthorizationCustomer,(req,res)=>{
    let uid=req.user;
    console.log("running get profile ")
    return Customer.findOne(
        {
            attributes: {exclude: ['password','createdAt','updatedAt'] },
            where:{cid:uid}
        }
    )
    .then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.sendStatus(500);
    })
})
router.get('/hello/:name',(req,res)=>{
    console.log("The hello request");
    console.log(req.params.name);
    res.sendStatus(200);
})
// Registering as a buyer customer
router.post('/register',async(req,res)=>{
    let {phonenumber,password,cp}=req.body;
    console.log(phonenumber,password);
    if(password===cp){
        const hash = await bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        return Customer.create({
            cid:"",
            fname:"", 
            lname:"",
            password:hash,
            telUname:"",
            phone:phonenumber,
            region:"",
            city:"",
        }).then(()=>{
            res.status(200).send("registeration verified");
        }).catch((err)=>{
            console.log(err);
            res.status(500).send("some thing went wrong ");
        })
    }
    else{
        res.sendStatus(500);
    }
})
router.post('/mregister',async(req,res)=>{
    let {phonenumber,password,cp}=req.body;
    console.log(phonenumber,password);
    let find;
    if(password===cp){
        const hash = await bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        return Customer.create({
            cid:"",
            fname:"", 
            lname:"",
            password:hash,
            telUname:"",
            phone:phonenumber,
            region:"",
            city:"",
        }).then(async(data)=>{
            let uid=data.cid;
            const user=uid;
            console.log("the user id is ",user);
            const accessToken=await jwt.sign(user,
                process.env.REFRESH_TOKEN_SECRET);
            // console.log("accessToken",accessToken);
            res.send({"u":accessToken});
        }).catch((err)=>{
            console.log(err);
            res.status(500).send("some thing went wrong ");
        })
    }
    else{
        res.sendStatus(500);
    }

})
 //  Requesting for forgot password
router.post('/forget',(req,res)=>{
    let {phonenumber}=req.body;
    return sequelize.models.Customer.findOne({
        where:{phone:phonenumber}
    }).then((data)=>{
        if(data){
            const user=data.toJSON();
            res.send(data.phone).status(200);
        }
        else{
            res.status(404).send("no user with this phone number ")
        }
    })
})
// Adding Items to  ma cart 
router.post('/addcart',checkAuthorizationCustomer,(req,res)=>{
    let pid=req.body.pid;
    let uid=req.user;
    console.log("query",req.query);
    console.log("body",req.body);
    if(!pid){
        pid=req.query.pid;
    }
    if(pid){
    return Cart.create({
        cid:"",
        CustomerCid:uid,
        ProductPid:pid
    })
    .then(data=>{
        console.log(data);
        res.sendStatus(200);
    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(404);
    })}
    else{
        res.sendStatus(400);
    }
})
// Getting Products in type and page 
router.get('/mycart',checkAuthorizationCustomer,(req,res)=>{
    let uid=req.user;
    Cart.findAndCountAll(
        {
            where:{CustomerCid:uid},
        }
    ).then((data)=>{
        if (data) {
            console.log("fetching the my cart")
            console.log(data.count)
            let item={
                count:data.count
            };
            res.send(item);
        } else {
            res.send();
        }
    }).catch((err)=>{
        res.sendStatus(500);
        console.log(err);
    })
})
// Getting users cart items 
router.get('/cart',checkAuthorizationCustomer,(req,res)=>{
    let uid=req.user;
    let no_response=4;
    let page=req.query.page==null?1:req.query.page;
    let jumpingSet=(page-1)*no_response;
    return Cart.findAndCountAll(
        {
            where:{CustomerCid:uid},
            offset: jumpingSet,
            limit: no_response,
            attributes:{exclude:["createdAt","updatedAt"]},
            include:{
                model:Product,
                attributes:{exclude:["createdAt","updatedAt","CategoryCid"]}
            }
        }
    ).then((data)=>{
        if (data) {
            let nopage=parseInt(data.count);
            data.count=nopage;
            res.send(data);
        } else {
            res.send();
        }
    }).catch((err)=>{
        res.status(404).send();
        console.log(err);
    })
})

router.get('/categories',(req,res)=>{
    Broadcategory.findAll({
        attributes:{exclude:["createdAt","updatedAt"]},
        include:{
            model:Category,
            attributes:{exclude:["createdAt","updatedAt"]}
        }
    }).then((data)=>{
        res.send(data);
    }).catch(err=>{
        console.log(err)
    })
})
router.get('/broadcategories',(req,res)=>{
    Broadcategory.findAll({
        attributes:{exclude:["createdAt","updatedAt"]},
    }).then((data)=>{
        res.send(data);
    }).catch(err=>{
        console.log(err)
    })
})
router.get('/:bc',checkAuthorizationCustomer,(req,res)=>{
    let cat=req.params.bc;
    return Broadcategory.findOne(
        {
            where:{name:cat},
            attributes:["pid"]
        }
    ).then((data)=>{
        if (data) {
            return Category.findAll({
                where:{BroadcategoryPid:data.pid},
            })
        } else {
            res.sendStatus(404);
        }
    })
    .then((data)=>{
        let first=data[0].cid;
        Product.find({
            where:{pid:first},
        
        })
    })
    .catch((err)=>{
        res.status(404).send();
        console.log(err);
    })
})
router.post("/order",checkAuthorizationCustomer,async(req,res)=>{
    let pid=req.body.pid?req.body.pid:req.query.pid;
    let uid=req.user;
    console.log("customer and product respectively are ",pid,uid)
    if(pid){
    return Product.findOne({
        attributes:["SellerSid","price"],
        where:{pid:pid}
    })
    .then(data=>{
        if(data){
            let sid=data.SellerSid;
            let price=data.price;
            return Orders.create({
                oid:"",
                ProductPid:pid,
                CustomerCid:uid,
                SellerSid:sid,
                totalPrice:price
            })
        }else{
            console.log("no product with this pid")
            return;
        }
        
    })
    .then((data)=>{
        if (data) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
        
    }).catch(err=>{
        console.log("the error occured is ",err)
        res.sendStatus(500);
    })
}else{
    res.sendStatus(400);
}
})
router.post('/changepp',checkAuthorizationCustomer,async(req,res)=>{
    let {fname,lname,telUname,email,region,city}=req.body;
 
    let uid=req.user;
    let=a=req.body;
    console.log("a",a);
    // console.log("fname",fname);
    // console.log("lname",lname);
    // res.sendStatus(200);
    return Customer.update({
        fname:fname,
        lname:lname,
        telUname:telUname,
        email:email,
        region:region,
        city:city
    },{
        where:{cid:uid}
    })
    .then(data=>{
        if(data){
            res.sendStatus(200);
        }else{
            res.sendStatus(404);
        }
    })
    .catch((err)=>{
        console.log(err);
        res.sendStatus(500);
    })
  
})
router.post('/changepassword',checkAuthorizationCustomer,async(req,res)=>{
    let {pp, np, cp}=req.body;
    let uid=req.user;
    console.log(req.body)
    if(np==cp){
        return Customer.findOne({
            attributes:[
                "password"
            ],
            where:{cid:uid}
        })
        .then(async (data)=>{
            const check=await bcrypt.compare(pp,data.password);
            if(check){  
                console.log("true")
                const hash = await bcrypt.hashSync(np, bcrypt.genSaltSync(10));
                return Customer.update({
                    password:hash
                },{
                    where:{cid:uid}
                }).then((data)=>{
                    console.log("succesful update")
                    if(data){
                        res.status(200).send("ok");
                    }
                })
            }else{
                console.log("false")
                res.sendStatus(404);
            }
        })
        .catch((err)=>{
            console.log(err);
            res.status(404);
        })
    
    }
})
router.post('/delcart',checkAuthorizationCustomer,(req,res)=>{
    let cid=req.body.cid?req.body.cid:req.query.cid;
    let uid=req.user;
    console.log(req.body);
    if(cid){
        return Cart.destroy({
        where:{cid:cid}
    }).then((data)=>{
        res.sendStatus(200);
    }).catch((err)=>{
        res.sendStatus(400);
    })
    }else{
        res.sendStatus(400);
    }
    
    
})
router.get('/abc',(req,res)=>{
    res.send("HELLO THIS IS HARENA MARKET PLACE  Enjoy Our Products");
})

module.exports=router;
