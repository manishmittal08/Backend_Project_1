const mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mongopractice');

const userSchema=mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: Number,
    role: {
        type: String,
        enum: ["admin","user"],
        default: "user"
    }
});

module.exports=mongoose.model("person",userSchema);