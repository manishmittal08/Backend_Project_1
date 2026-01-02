const mongoose=require('mongoose');
const productSschema=mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    image: String,
    category: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports=mongoose.model("Product",productSschema);