const Tesseract=require("tesseract.js")
const Jimp=require("jimp")
const QrCode=require("qrcode-reader")

async function readQR(path){
 try{
  const img=await Jimp.read(path)
  const qr=new QrCode()
  return new Promise(res=>{
   qr.callback=(err,val)=>{res(val?val.result:null)}
   qr.decode(img.bitmap)
  })
 }catch{return null}
}

async function readText(path){
 const r=await Tesseract.recognize(path,"eng")
 return r.data.text.toUpperCase()
}

function validName(t){
 return t.includes("JAMAL SAID KAZEMBE")||
 t.includes("JAMAL SAID")||
 t.includes("JAMAL KAZEMBE")
}

function currency(t){
 const m=t.match(/(TZS|TSh|USD|KES|UGX)\s?(\d+)/i)
 return m?parseInt(m[2]):null
}

function phone(t){
 return t.includes("655510714")||t.includes("780526437")
}

function trx(t){
 return /[A-Z0-9]{8,}/.test(t)
}

module.exports=async function analyze(path){
 let text=await readQR(path)
 if(!text) text=await readText(path)

 if(!text) return {valid:false}

 if(!validName(text)) return {valid:false}
 if(!trx(text)) return {valid:false}
 if(!phone(text)) return {valid:false}

 const amount=currency(text)
 if(!amount) return {valid:false}

 const seconds=(amount/500)*3600

 return{
  valid:true,
  seconds
 }
}
