const {initilization}=require("./db/db.connect");
initilization();
const express=require("express");
const app=express();
app.use(express.json());
const cors=require("cors");
app.use(cors());
const SalesAgent=require("./models/SalesAgent.model");
const LeadSchema = require("./models/LeadSchema.model");
const Comment=require("./models/CommentSchema.model");


///sales agents route in post/////
async function createSalesAgent(addAgent){
    try{
   const newAgent=new SalesAgent(addAgent);
   const savedAgent = await newAgent.save();
   return savedAgent;
    }catch(error){
        throw error;
    }
}
app.post("/agents",async(req,res)=>{
    try{
     const agent= await createSalesAgent(req.body);
     if(agent){
        res.status(201).json({message:"Agent added successfully",agent:agent})
     }else{
        res.status(400).json({error:"Agent not added"})
     }
    }catch(error){
        res.status(500).json({error:"Not able to add agent"})
    }
})

//post routes for leads //////
async function createLead(addLead){
    try{
    const newLead=new LeadSchema(addLead);
    const savedLead=await newLead.save();
    return savedLead
    }catch(error){
        throw error;
    }
}
app.post("/leads",async(req,res)=>{
    try{
   const lead=await createLead(req.body);
   if(lead){
    res.status(201).json({message:"Lead added successfully",lead:lead})
   }else{
   res.status(400).json({error:"Lead not added"})
   }
    }catch(error){
        res.status(500).json({error:"Not able to add lead"})
    }
})



///updare lead status/////
async function updateLeadStatus(LeadId,leadData){
    try{
    const updatedLead=await LeadSchema.findByIdAndUpdate(LeadId,  { ...leadData }, // पूरा object update होगा
      { new: true, runValidators: true } // runValidators=true ताकि schema validations लागू हों
    ).populate("salesAgent", "name");
    return updatedLead
    }catch(error){
        throw error;
    }
}
app.post("/leads/:id",async(req,res)=>{
    try{
    const Lead=await updateLeadStatus(req.params.id,req.body);
    if(Lead){
        res.status(200).json({message:"Lead status update successfully",lead:Lead})
    }else{
        res.status(400).json({error:`Lead with ID '${req.params.id}' not found`})
    }
    }catch(error){
        res.status(500).json({error:"Not able to update lead ststus"})
    }
})

////delete lead//////
async function deleteLead(LeadId){
    try{
    const deleteLead=await LeadSchema.findByIdAndDelete(LeadId);
    return deleteLead;
    }catch(error){
        throw error;
    }
}
app.delete("/leads/:id",async(req,res)=>{
    try{
    const lead=await deleteLead(req.params.id);
    if(lead){
        res.status(200).json({message:"Lead delete successfully",lead:lead})
    }else{
        res.status(400).json({error:`Lead with ID '${req.params.id}' not found`})
    }
    }catch(error){
        res.status(500).json({error:"Not able to delete lead"})
    }
})

//get routes for leads//////
async function getAllLeads(){
    try{
   const leads=await LeadSchema.find().populate("salesAgent", "id name");
   return leads;
    }catch(error){
        throw error;
    }
}

app.get("/leads",async(req,res)=>{
    try{
   const leads=await getAllLeads();
   if(leads){
    res.status(200).json({leads:leads})
   }else{
    res.status(404).json({error:"Leads not found"})
   }
    }catch(error){
        res.status(500).json({error:"Not able to fetch leads"})
    }
})

//post routes for commnts//////
async function createComment(addComment,leadId){
    try{
    const newComment = new Comment({
      ...addComment,   // spread other fields from req.body (like author, commentText)
      lead: leadId     // explicitly link to the lead ID from URL
    });
    const savedComment=await newComment.save();
    return savedComment;
    }catch(error){
        throw error;
    }
}
app.post("/leads/:id/comments",async(req,res)=>{
    try{
    const comment=await createComment(req.body,req.params.id);
    if(comment){
        res.status(201).json({message:"Comment added successfully",comment:comment})
    }else{
        res.status(400).json({error:`Lead with ID '${req.params.id}' not found`})
    }

    }catch(error){
        res.status(500).json({error:"Not able to add comment"})
    }
})

//get routes for comments//////
async function getCommnetsByLead(leadId){
    try{
     const comments=await Comment.find({ lead: leadId });
     console.log(comments)
     return comments;
    }catch(error){
        throw error;
    }
}
app.get("/leads/:id/comments",async(req,res)=>{
    try{
   const xomments=await getCommnetsByLead(req.params.id);
   if(xomments){
    res.status(200).json({message:"Comments fetched successfully",comments:xomments})
   }else{
    res.status(404).json({error:"Comments not found"})
   }
    }catch(error){
        res.status(500).json({error:"Not able to fetch commnets"})
    }
})

////Reporting API /////
async function leadReport(){
    try{
    const today=new Data();
    const lastWeek=new date();
    lastWeeek.setDate(today.getDate()-7);
    const leadsClosedLastWeek=await LeadSchema.find({
        status:"Closed",
        closedAt:{ $gte:lastWeek,$lte:today}
    }).populate("saleAgent","id name").select("name saleAgent closedAt");
    return leadsClosedLastWeek.map((lead)=>({
       id:lead._id,
       name:lead.name,
       salesAgent:lead.salesAgent.name,
      closedAt:lead.closedAt
    }))
    }catch(error){
        throw error;
    }
}
app.get("/report/last-week",async(req,res)=>{
    try{
  const report = await leadReport();
  if(report.length>0){
    res.status(200).json({report:report})
  }else{
    res.status(404).json({error:"No leads closed in the last week"})
  }
    }catch(error){
        res.status(500).json({error:"Not able to fetch data"})
    }
})
//pipeline for report //////
async function leadReportPipeline(){
    try{
    const count = await LeadSchema.countDocuments({status:"closed"});
    return count;
    }catch(error){
        throw error;
    }
}
app.get("/report/pipeline",async(req,res)=>{
    try{
   const pipeline=await leadReportPipeline();
   if(pipeline){
    res.status(200).json({message:"Pipeline fetched successfully",pipeline:pipeline})
   }else{
    res.status(404).json({error:"No leads in pipeline"})
   }
    }catch(error){
        res.status(500).json({error:"Not able to fetch data"})
    }
})

app.get("/",(req,res)=>{
    res.send("Welcome to CRM backend");
})

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
