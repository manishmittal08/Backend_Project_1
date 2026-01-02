const attachUser=require("./middlewares/attachUser");
const express=require('express');
const app=express();
const userModel=require('./models/user');
const productModel=require('./models/product');
const isAdmin=require("./middlewares/isAdmin");

const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const path=require('path');
const PORT = process.env.PORT || 4000;

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());
app.use(attachUser);
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    next();
})

app.get("/", (req,res)=>{
    res.status(200).render('index');
})
app.post("/create", (req,res)=>{
    try {
        let {username, email, password, age}=req.body;
        console.log('POST /create body:', req.headers['content-type'], req.body);
        bcrypt.genSalt(10,(err,salt)=>{
            if(err) return res.status(500).send('Error generating salt');
            bcrypt.hash(password,salt,async (err,hash)=>{
                try {
                    if(err) return res.status(500).send('Error hashing password');
                    const user= await userModel.create({
                    username: username,
                    email: email,
                    password: hash,
                    age: age
                    })
                  let token=jwt.sign({id: user._id},"Manish_Mittal_Ji");
                  res.cookie("token",token); 
                  console.log('User created:', user._id);
                  if (req.is('application/json') || (req.get('Accept') && req.get('Accept').includes('application/json'))) {
                      return res.status(201).json({ user });
                  }
                  return res.status(201).render('users',{user: user});
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Error creating user');
                }
            })
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})
app.get('/login',(req,res)=>{
    res.status(200).render('login');
})
app.post('/login',async (req,res)=>{
    try {
        let user=await userModel.findOne({email: req.body.email});
        if(!user) return res.status(401).send("Email or Password is wrong");
        bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if(err) return res.status(500).send('Error comparing passwords');
            if(result){
                let token=jwt.sign({id: user._id},"Manish_Mittal_Ji");
                res.cookie("token",token);
                // console.log(user);
                res.status(200).render('users',{user:user});
            }
            else {
                return res.status(401).send("Email or Password is wrong.")
            };   
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})
app.get("/delete/:id",isAdmin, async (req,res)=>{
    try {
        const user=await userModel.findOneAndDelete({_id: req.params.id});
            res.clearCookie("token");
            res.redirect(302, "/");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
})
app.get("/edit/:id",isAdmin, async (req,res)=>{
    try {
        const user=await userModel.findOne({_id: req.params.id});
        res.status(200).render('edit',{user: user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user');
    }
})
app.post("/update/:id",isAdmin, async (req, res) => {
    try {
        let { username, email, password, age } = req.body;
        const update = { username, email, age };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            update.password = hash;
        }
        const user = await userModel.findOneAndUpdate({ _id: req.params.id }, update, { new: true });
        let token=jwt.sign({id: user._id},"Manish_Mittal_Ji");
        res.cookie("token",token);
        return res.status(200).render('users', { user: user });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
app.get("/products",async (req,res)=>{
    try {
        const products=await productModel.find();
        console.log("Current User:",req.user);
        res.status(200).render("products",{products: products});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    }
})
app.post("/products",isAdmin, async (req,res)=>{
    try {
        const {title,description,price,image,category}=req.body;
        await productModel.create({
            title: title,
            description: description,
            price: price,
            image: image,
            category: category,
        });
        res.redirect(303, "/products");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating product');
    }
})
app.get('/products/new',isAdmin,(req,res)=>{
    res.status(200).render("addProducts");
})
app.get("/products/delete/:id",isAdmin, async (req,res)=>{
    try {
        await productModel.findOneAndDelete({_id: req.params.id});
        const products=await productModel.find();
        res.status(200).render("products",{products: products});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting product');
    }
})
app.get("/products/edit/:id",isAdmin, async (req,res)=>{
    try {
        const products=await productModel.findOne({_id: req.params.id});
        console.log(products);
        res.status(200).render('editProduct',{products: products});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product');
    }
})
app.post("/products/update/:id",isAdmin, async (req, res) => {
    try {
        const { title, description, price, image, category } = req.body;
        const product = await productModel.findOneAndUpdate(
            { _id: req.params.id },
            { title, description, price, image, category },
            { new: true }
        );
        res.redirect(303, "/products");
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

app.get("/logout",(req,res)=>{
    res.clearCookie("token");
    res.redirect(302, "/");
})
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}.`);
});
