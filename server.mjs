import express from "express";
import OpenAI from "openai";

const app=express();
const port=process.env.PORT||3000;
app.use(express.json({limit:"100kb"}));
app.use(express.static("."));

app.post("/api/blueprint",async(req,res)=>{
  try{
    const idea=String(req.body?.idea||"").trim();
    if(!idea) return res.status(400).json({error:"Idea is required"});
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured"});
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const response=await client.responses.create({
      model:"gpt-5.6-luna",
      store:false,
      instructions:"You are BIZORA, an AI business launch strategist. Turn the user's business idea into a practical, realistic launch blueprint. Be specific, concise, India-friendly when useful, and never invent market research or guaranteed profits.",
      input:`Create a business blueprint for this idea:\n\n${idea}`,
      text:{format:{type:"json_schema",name:"bizora_blueprint",strict:true,schema:{type:"object",properties:{name:{type:"string"},concept:{type:"string"},customers:{type:"string"},problem:{type:"string"},pricing:{type:"string"},cost:{type:"string"},revenue:{type:"string"},plan:{type:"array",items:{type:"object",properties:{title:{type:"string"},detail:{type:"string"}},required:["title","detail"],additionalProperties:false}},social:{type:"array",items:{type:"string"}},next:{type:"array",items:{type:"string"}}},required:["name","concept","customers","problem","pricing","cost","revenue","plan","social","next"],additionalProperties:false}}}
    });
    const data=JSON.parse(response.output_text);
    res.json(data);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"AI generation failed"});
  }
});

app.listen(port,()=>console.log(`BIZORA running on port ${port}`));
