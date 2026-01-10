const mongoose=require("mongoose");
const orderSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "person",
        required: true
    },
    items: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            price: Number,
            quantity: Number
        }
    ],
    // Automatic Discount
    grandTotal: Number,
    discountamount: Number,
    
    // Coupon Discount
    couponUsed: String,
    couponDiscount: Number,

    finalamount: Number,

    address: String,
    phone: String,

    status:{
        type: String,
        default: "Placed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model("order",orderSchema);