const mongoose=require("mongoose");
require("dotenv").config();

const initilization = async()=>{
   await mongoose.connect(process.env.Mongo_Url)
   .then(()=>{
    console.log("Connected to MongoDB")
   }).catch((error)=>{
    console.log("Error connecting to MOngoDB",error)
   })
}

module.exports={initilization}