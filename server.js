const express=require("express")
const multer=require("multer")
const {OAuth2Client}=require("google-auth-library")
const db=require("./db")
const analyze=require("./analyzer")

const CLIENT_ID="105332735242-j7magp9o9b6jro86itcaek89gmp304fv.apps.googleusercontent.com"

const client=new OAuth2Client(CLIENT_ID)

const app=express()
app.use(express.json())
app.use(express.static("public"))

const upload=multer({dest:"uploads/"})

function createToken(n){
 return String(n).padStart(10,"0")
}

app.post("/verify",async(req,res)=>{
 try{
  const ticket=await client.verifyIdToken({
   idToken:req.body.token,
   audience:CLIENT_ID
  })

  const email=ticket.getPayload().email

  db.get("SELECT * FROM users WHERE email=?",[email],(e,row)=>{

   if(row){
    db.run("UPDATE users SET lastvisit=? WHERE email=?",
    [Date.now(),email])
    res.json({token:row.token})
   }
   else{

    db.get("SELECT COUNT(*) c FROM users",(e,r)=>{
     const token=createToken(r.c+1)

     db.run(
      "INSERT INTO users VALUES(?,?,?)",
      [email,token,Date.now()]
     )

     res.json({token})
    })
   }

  })

 }catch{
  res.status(401).send("invalid")
 }
})

app.post("/upload",upload.single("file"),async(req,res)=>{

 const result=await analyze(req.file.path)

 if(!result.valid){
  res.json({valid:false})
 }
 else{
  res.json({
   valid:true,
   seconds:result.seconds
  })
 }

})

setInterval(()=>{

 const limit=Date.now()-120*3600*1000

 db.all("SELECT * FROM users WHERE lastvisit<?",[limit],
 (e,rows)=>{

  rows.forEach(r=>{
   db.run("DELETE FROM users WHERE email=?",[r.email])
  })

 })

},3600000)

app.listen(3000)
