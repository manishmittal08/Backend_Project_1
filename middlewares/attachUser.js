const jwt= require("jsonwebtoken");
const userModel=require("../models/user");

async function attachUser(req,res,next) {
    const token=req.cookies.token;
    if(!token){
        req.user=null;
        return next();
    }
    try{
        const decoded=jwt.verify(token,"Manish_Mittal_Ji");
        const user=await userModel.findById(decoded.id);
        req.user=user || null;
    }catch(error){
        req.user=null;
    }
    next();
}
module.exports=attachUser;