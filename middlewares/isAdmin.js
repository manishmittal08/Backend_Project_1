function isAdmin(req,res,next){
    if(!req.user){
        return res.status(401).send("Login Required..");
    }
    if(req.user.role!== "admin"){
        return res.status(403).send("Admin access only..");
    }
    next();
}
module.exports=isAdmin;