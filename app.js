const attachUser=require("./middlewares/attachUser");
const express=require('express');
const app=express();
const userModel=require('./models/user');
const productModel=require('./models/product');
const orderModel=require("./models/order");
const isAdmin=require("./middlewares/isAdmin");
const session = require('express-session');

const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const path=require('path');

require('dotenv').config();
const PORT = process.env.PORT || 4000;
const sendOrdermail=require('./utils/sendMail');

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
app.use(session({
    secret: "cart_secret_key",
    resave: false,
    saveUninitialized: true,
}));
function calculateDiscount(grandTotal) {
  let discountPercentage = 0;
     if(grandTotal>=100000){
        discountPercentage=25;
       }else if(grandTotal>=50000){
        discountPercentage=10;
       }else if(grandTotal>=25000){
        discountPercentage=5;
       }

  const discountAmount = Math.round((grandTotal * discountPercentage) / 100);
  const finalAmount = Math.round(grandTotal - discountAmount);

  return {
    discountPercentage,
    discountAmount,
    finalAmount
  };
}
function isValidPhone(phone){
    return /^\+91[6-9][0-9]{9}$/.test(phone);
}

// Centralized totals calculation (auto discount + coupon)
function computeTotals(grandTotal, couponCode) {
    const auto = calculateDiscount(grandTotal);
    const discountAmount = auto.discountAmount || 0;
    const autoFinal = auto.finalAmount;

    let couponUsed = null;
    let couponDiscount = 0;

    if (couponCode === 'SAVE10') {
        couponUsed = 'SAVE10';
        couponDiscount = Math.round((autoFinal * 10) / 100);
    } else if (couponCode === 'SAVE25') {
        couponUsed = 'SAVE25';
        couponDiscount = Math.round((autoFinal * 25) / 100);
    }

    const finalAmount = Math.round(autoFinal - couponDiscount);

    return {
        grandTotal,
        discountAmount,
        autoFinal,
        couponUsed,
        couponDiscount,
        finalAmount
    };
}


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
                // console.log("Current User:",user);
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
       // console.log("Current User:",req.user);
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
        //console.log(products);
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
app.post("/cart/add/:id",async (req,res)=>{
    try{
        const productId=req.params.id;
        const user=req.user;

        if(!user) return (res.redirect("/login"));
            user.cart.push({
                product: productId,
                quantity: 1
            });
        await user.save();
        res.redirect("/cart");
        // const product=await productModel.findById(productId);
        // if(!product){
        // return res.redirect("/products");
        // }
        // if(!req.session.cart){
        //     req.session.cart=[];
        // }
        // const existingItem = req.session.cart.find(item => {
        //     return item.product && item.product._id.toString() === productId;
        // });
        // if (existingItem) {
        //     existingItem.quantity += 1;
        // } else {
        //     req.session.cart.push({
        //         product: product,
        //         quantity: 1
        //     });
        // }
        // console.log(req.session.cart);
        // res.redirect("/cart");
    } catch(err){
        console.error(err);
        res.redirect("/products");
    }
});
app.get("/cart",async (req,res)=>{
    if(!req.user) return res.redirect("/login");
    const user=await req.user.populate("cart.product");
    let grandTotal=0;
    user.cart.forEach(item=>{
        grandTotal+=item.product.price*item.quantity
    });
    // discount from session(If applied)
    const discount=req.session.discount || {
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: grandTotal
    };
    res.render("cart", {cart: user.cart,grandTotal,discount});
})
app.post("/cart/increase/:id",async (req,res)=>{
    const productId=req.params.id;
    const user=req.user;
    const itemIdx=user.cart.findIndex(item=> item.product._id.toString()===productId);
    if(itemIdx>=0){
        user.cart[itemIdx].quantity+=1;
        await user.save();
        // delete req.session.discount;
    }
     await user.save();
    res.redirect("/cart");
})
app.post("/cart/decrease/:id",async (req,res)=>{
    const productId=req.params.id;
    const user=req.user;
    const itemIdx=user.cart.findIndex(item=> item.product._id.toString()===productId);
    if(itemIdx!==-1){
        if(user.cart[itemIdx].quantity >1){
            user.cart[itemIdx].quantity-=1;
             await user.save();
            //delete req.session.discount;
        }else{
            user.cart.splice(itemIdx,1);
             await user.save();
            //delete req.session.discount;
        }
        await user.save();
    }
    res.redirect("/cart");
})
app.post("/cart/check-discount",async (req,res)=>{
    if(!req.user) return res.redirect("/login");
    const user=await req.user.populate("cart.product");
    const cart=user.cart || [];
    let grandTotal=0;
    cart.forEach(item=>{
        grandTotal+= item.product.price * item.quantity;
    })
    const discount=calculateDiscount(grandTotal);
    req.session.discount=discount;
    res.redirect("/cart");
})
app.get("/checkout", async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await req.user.populate("cart.product");
  let grandTotal = 0;
  user.cart.forEach(item => {
    grandTotal += item.product.price * item.quantity;
  });

  const discount = calculateDiscount(grandTotal);
  let totalAmount=discount.finalAmount;
  res.render("checkout", {
    cart: user.cart,
    grandTotal,
    discount,
    userEmail: user.email,
    totalAmount
  });
});

app.post("/checkout", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const { address, phone, coupon, confirmEmail, totalAmount } = req.body;
    const user = await req.user.populate("cart.product");

    if (user.cart.length === 0) {
      return res.redirect("/cart");
    }
    if(!isValidPhone(phone)){
        return res.status(400).send("Invalid Phone Number!");
    }
    // 1. Grand total
    let grandTotal = 0;
    user.cart.forEach(item => {
      grandTotal += item.product.price * item.quantity;
    });

        // determine coupon: prefer explicit form value, then session-stored coupon
        const appliedCoupon = coupon || req.session.coupon || null;

        // 2-3. Apply automatic discount and coupon consistently
        const totals = computeTotals(grandTotal, appliedCoupon);
        const autoDiscount = { discountAmount: totals.discountAmount, finalAmount: totals.autoFinal };
        let finalAmount = totals.finalAmount;
        let couponDiscount = totals.couponDiscount;
        let couponUsed = totals.couponUsed;

    // 4. Save order
    const order = new orderModel({
      user: user._id,
      items: user.cart.map(item => ({
        product: item.product._id,
        price: item.product.price,
        quantity: item.quantity
      })),
      grandTotal,
      discountamount: autoDiscount.discountAmount,
      couponUsed,
      couponDiscount,
      finalamount: finalAmount,
      address,
      phone
    });

        await order.save();

        // Log saved order totals for debugging
        console.log('ORDER SAVED - totals:', {
            orderId: order._id,
            grandTotal: order.grandTotal,
            discountamount: order.discountamount,
            couponUsed: order.couponUsed,
            couponDiscount: order.couponDiscount,
            finalamount: order.finalamount
        });

        try {
            await sendOrdermail(user.email, await order.populate("items.product"));
        } catch (emailError) {
            console.log("Email sending failed:", emailError);
            // Continue with cart clearing even if email fails
        }
    
    // 5. Clear cart
    user.cart = [];
    await user.save();

    // clear session coupon after order placed so it doesn't linger
    if (req.session && req.session.coupon) req.session.coupon = null;

    res.redirect(`/order/success/${order._id}`);
  } catch (err) {
    console.log(err);
    res.redirect("/checkout");
  }
});

app.post("/apply-coupon",async (req,res)=>{
    if (!req.user) return res.redirect("/login");
    const {coupon}=req.body;
    const user=await req.user.populate("cart.product");

    let grandTotal=0;
    user.cart.forEach(item => {
      grandTotal += item.product.price * item.quantity;
    });

    const autoDiscount = calculateDiscount(grandTotal);
    let finalAmount = autoDiscount.finalAmount;

    // Use computeTotals to validate and calculate coupon
    const totals = computeTotals(grandTotal, coupon);
    if (!totals.couponUsed) {
        return res.json({
            success: false,
            message: "Invalid or not applicable coupon"
        });
    }
    req.session.coupon = coupon;
    res.json({
        success: true,
        totalAmount: totals.finalAmount,
        message: "Coupon applied successfully!"
    });
});
app.get('/order/success/:id',async (req,res)=>{
    try{
        const order=await orderModel.findById(req.params.id).populate("items.product").populate("user");
        if(!order){
            return res.redirect("/products");
        }
        res.render("orderSuccess",{order});
    }catch(err){
        console.log(err);
        res.redirect("/products");
    }
});

app.get("/logout",(req,res)=>{
    res.clearCookie("token");
    res.redirect(302, "/");
})
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}.`);
});
