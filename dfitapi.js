const express=require("express");
const app=express()
const port = 1234;
const {google}=require("googleapis");
const request=require("request");
const cors=require("cors");
const urlParse=require("url-parse");
const queryParse=require("query-string");
const bodyParser=require("body-parser");
const axios=require("axios");



app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get("/getURLTing",(req,res)=>{
    const oauth2Client=new google.auth.OAuth2(
        "257442106703-kcepgmg263edatjva9iht74p3otiito3.apps.googleusercontent.com",
        "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",
        "http://localhost:1234/steps"
    );
    const scopes=["https://www.googleapis.com/auth/fitness.activity.read profile email openid"];
    const url=oauth2Client.generateAuthUrl({
        access_type:"offline",
        scope:scopes,
        state: JSON.stringify({
            callbackUrl:req.body.callbackUrl,
            userID:req.body.userid
        })
    });

    request(url,(err,response,body)=>{
        console.log("error:",err);
        console.log("statusCode: ",response && response.statusCode);
        res.send({url});
    });
});

app.get("/steps",async(req,res)=>{
    const queryURL=new urlParse(req.url);
    const code=queryParse.parse(queryURL.query).code;
    const oauth2Client=new google.auth.OAuth2(
        "257442106703-kcepgmg263edatjva9iht74p3otiito3.apps.googleusercontent.com",
        "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",
        "http://localhost:1234/steps"
    );

    const tokens=await oauth2Client.getToken(code);
    //console.log(tokens);
    res.send("HELLO");

    let stepArray=[];
    try{
const result= await axios({
    method:"POST",
    headers:{
        authorization:"Bearer "+ tokens.tokens.access_token
    },
    "Content-Type":"application/json",
    url:`https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
    data:{
        aggregateBy:[
            {
                dataTypeName: "com.google.step_count.delta",
    dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }
        ],
        bucketByTime:{durationMillis:86400000},
        startTimeMillis:1670286840000,
        endTimeMillis:1670865524004,
    },

}); 
console.log(result);
stepArray=result.data.bucket
    } catch(e){
        console.log(e);
    }
    try{
        for(const dataSet of Object.keys(stepArray||{})){ 
            console.log(stepArray[dataSet]);
        }
    }catch(e){console.log(e);}
});
app.listen(port,()=>console.log(`Listeningg on ${port}`));