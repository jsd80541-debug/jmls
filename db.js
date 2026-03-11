const sqlite3=require("sqlite3").verbose()
const db=new sqlite3.Database("./database.db")

db.serialize(()=>{
db.run(`
CREATE TABLE IF NOT EXISTS users(
email TEXT PRIMARY KEY,
token TEXT,
lastvisit INTEGER
)
`)
})

module.exports=db
