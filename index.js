require('dotenv').config();
const express = require('express');
const cors=require("cors");
const {sequelize}=require('./models');
const { Sequelize } = require('sequelize');
const app = express();
const adminRoutes=require('./routes/adminRoutes');
const customerRoutes=require('./routes/customerRoutes');
const sellerRoutes=require('./routes/sellerRoutes');
const bcrypt=require('bcrypt');
var cookieParser=require('cookie-parser');
const { Op} = require('sequelize');
const { json } = require('express');
const{Admin,Cart,Category,Customer,Orders,Pictures,Product,Seller,Broadcategory}=sequelize.models;
const port =process.env.PORT||5000
async function main() {
    // creating database structures
    await sequelize.sync({force:true});
    console.log("finished")
} 
async function tableChange() {
    await Product.sync({alter:true});
    console.log("finished")
}
// tableChange();
async function addSeller() {
    const hash = await bcrypt.hashSync("789", bcrypt.genSaltSync(10));
    console.log(hash);
    await Seller.create({
        sid:"",
        managerFname:"Naol",
        manageLname:"Getachew",
        companyName:"Metebaber",
        phoneNo:"+251966003808",
        region:"Oromia",
        Stream:"Fashio",
        city:"Jimma",
        subcity:"bole",
        slocation:"Bole,Golagol Tower",
        password:hash
    })
    console.log("finished")
}
async function checkdb(){
    try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
checkdb();
// addSeller();
// main();
// addAdmin()
// main() creating the database 
// app.set("view engine","ejs")
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors({
    origin: ['https://harena.netlify.app','http://localhost:7494',"https://harena.onrender.com"],
    credentials:true,
}));
// app.options('*', cors());
app.use(express.json()); 
app.use(cookieParser());
app.use('/custom',customerRoutes);
app.use('/special',adminRoutes);
app.use('/sel',sellerRoutes);
app.get('/images/:picid',(req,res)=>{
    let id=req.params.picid;
    console.log("fetch image - ",id)
        return Pictures.findOne({
            where:{id:id}
        }).then(data=>{
            if(data){
                return data.picpath;
            }
        }).then(data=>{
        if(data){
            res.sendFile(__dirname+'/dbImages/'+data)
        }
        else{
            res.sendStatus(404);
        }
    }).catch(err=>{
        console.log(err);
    })
    

})
app.get('/bcat/',(req,res)=>{
    console.log(req.query);
    let page=req.query.page==null?1:req.query.page;
    let bname=req.query.bname;
    if (bname==null) {
        res.sendStatus(404);
    }
    let no_response=6;
    let limit=1;
    let jumpingSet=(page-1)*no_response;
    return Broadcategory.findOne({
        where:{name:bname},
        include:{
            model:Category,
            attributes:[
                "cid"
            ]
        }
    }).then(async (response)=>{
        if (response) { 
            let cid;
            let data;
            if(response.Categories.length<3){
                cid={"id":response.Categories[0].cid}
                const { count, rows } = await Product.findAndCountAll({
                    order:[
                        ["createdAt","DESC"]
                    ],
                    attributes:{exclude:["createdAt","updatedAt"]},
                    offset: jumpingSet,
                    limit: no_response,
                    where:{CategoryCid:cid.id}
                })
                data={
                    count:count,
                    data:rows
                };
            }else{
                cid={
                    "id":response.Categories[0].cid,
                    "id1":response.Categories[1].cid,
                    "id2":response.Categories[2].cid
                };
                const { count, rows } = await Product.findAndCountAll({
                    order:[
                        ["createdAt","DESC"]
                    ],
                    attributes:{exclude:["createdAt","updatedAt"]},
                    offset: jumpingSet,
                    limit: no_response,
                    where:{
                        CategoryCid:{
                            [Op.or]:[
                                cid.id,
                                cid.id1,
                                cid.id2
                            ]}
                    }
                })
                let nopage=parseInt(count/no_response);
                data={
                    count:nopage,
                    data:rows
                };
            }  
            return data;
        }
        else{
            return;
        }
    })
    .then((data)=>{
        if (data) {
            res.send(data);
        } else {
            res.sendStatus(404);
        }
    })
})
app.get('/',(req,res)=>{
    console.log(req.query);
    let page=req.query.page==null?1:req.query.page;
    let type=req.query.subname==null?"electronics":req.query.subname;
    let no_response=6;
    let limit=1;
    let jumpingSet=(page-1)*no_response;
    console.log(type,page);
    return Category.findOne({
        where:{cname:type}
    }).then(async(response)=>{
        if (response) {
            let categorycid=response.cid;
            const { count, rows } = await Product.findAndCountAll({
                order:[
                    ["createdAt","DESC"]
                ],
                attributes:{exclude:["createdAt","updatedAt"]},
                offset: jumpingSet,
                limit: no_response,
                where:{CategoryCid:categorycid}
            });
        let nopage=parseInt(count/no_response);
        console.log(rows);
        let data={
            count:nopage,
            data:rows
        };
            return data;
        }
        else{
            return;
        }
    })
    .then((data)=>{
        if (data) {
            console.log(data)
            res.send(data);
        } else {
            res.sendStatus(404);
        }
    })
})
app.get('/company',async(req,res)=>{
    console.log(req.query);
    let page=req.query.page==null?1:req.query.page;
    let cpname=req.query.cpname;
    if(cpname==null){
        res.sendStatus(400);
        return;
    }
    let no_response=4;
    let limit=1;
    let jumpingSet=(page-1)*no_response;
    return Seller.findOne({
        attributes:["sid"],
        where:{companyName:cpname}
    }).then(async(response)=>{
        if (response) {
            let sellersid=response.sid;
            const { count, rows } = await Product.findAndCountAll({
                order:[
                    ["createdAt","DESC"]
                ],
                attributes:{exclude:["createdAt","updatedAt"]},
                offset: jumpingSet,
                limit: no_response,
                where:{SellerSid:sellersid}
            });
        let nopage=parseInt(count/no_response);
        let data={
            "count":nopage,
            "rows":rows
        };
            return data;
        }
        else{
            return;
        }
    })
    .then((data)=>{
        if (data) {
            console.log(data)
            res.send(data);
        } else {
            res.sendStatus(404);
        }
    })
})
app.get('/category/:cname',async(req,res)=>{
    console.log(req.params);
    const name=req.params.cname;
    Broadcategory.findOne({
        attributes:{exclude:["createdAt","updatedAt"]},
        include:{
            model:Category,
            attributes:{exclude:["createdAt","updatedAt","BroadcategoryPid"
            ]}
        },
        where:{name:name}
    }).then(async(data)=> {
        
        if(data){
            res.json( data);
        }
        else{
            res.sendStatus(404);
        }
        
    }).catch(err=>{
        console.log(err)
    })
})
app.get('/search',async(req,res)=>{
    let item=req.query.item;
    let page=req.query.page!=null?req.query.page:1;
    let no_response=6;
    let limit=1;
    // blue tshirt
    let jumpingSet=(page-1)*no_response;
    if(item){
    console.log(page,item);
    return  Product.findAndCountAll({
        order:[
            ["createdAt","DESC"]
        ],
        attributes:{exclude:["createdAt","updatedAt","CategoryCid"]},
        offset: jumpingSet,
        limit: no_response,
        where:{
                [Op.or]:[
                    {pname:
                        {[Op.eq]: item}
                    },
                    {pname:
                        {[Op.startsWith]: item}
                    },
                    {pname:
                        {[Op.substring]: item}
                    },
                    {description:
                        {[Op.substring]: item}
                    },
                    
                ]
        }
    })
    
    .then(data=>{
        // console.log(data);
        if(data){
           let nopage=parseInt(data.count/no_response);
           data.count=nopage; 
           res.send(data);
        }
        else res.sendStatus(404);

    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(404);
    })}
    else{
        res.sendStatus(404);
    }
    // console.log(count);
    // console.log(rows);
        })
app.get('/subcategory/',async(req,res)=>{
    const cname=req.query.cname;
    const page=req.query.page!=null?req.query.page:1;
    console.log(cname,page);
    let no_response=6;
    let jumpingSet=(page-1)*no_response;
    Category.findOne({
        attributes:["cid"],
        where:{cname:cname}
    }).then((data)=>{
        if(data){
            let cid=data.cid;
        return  Product.findAndCountAll({
            order:[
                ["createdAt","DESC"]
            ],
            attributes:{exclude:["createdAt","updatedAt"]},
            offset: jumpingSet,
            limit: no_response,
            where:{CategoryCid:cid}
        });
        }
        return null;
    })
    .then(data=>{
        // console.log(data);
        if(data){
        let nopage=parseInt(data.count/no_response);
        data.count=nopage;
        console.log(data.count);
        res.send(data); 
        }else res.sendStatus(404);
        
    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(404);
    })
})
app.get('/details/:id',async(req,res)=>{
    let id=req.params.id;
    console.log("the id is ",id);
    return Product.findOne(
        {
            attributes:{exclude:["createdAt","updatedAt"]},
            where:{pid:id},
            include:[{
                model:Pictures,
                attributes:{exclude:["createdAt","updatedAt","picpath"]}
            },
            {
                model:Seller,
                attributes:["companyName","slocation"]
            }
        ],
        }
    ).then(async (data)=> {
        if(data){
            res.send(data);
        }
        else{
            res.sendStatus(404);
        }
    })
    .catch(err=>{
        console.log("the error is ",err);
        res.sendStatus(404);

    })
})

app.listen(port,()=>{
    console.log("server is up and running 5000");
})
