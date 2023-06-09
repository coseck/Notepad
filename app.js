require("dotenv").config();
const express =require("express");
const bodyParser =require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date=require(__dirname+"/date.js");


const app=express();
//  const items=["food ","new game","study"];
// const workitems=[];
app.set("view engine","ejs");

app.use(bodyParser.urlencoded ({extended:true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.LINKM);
// mongodb://127.0.0.1:27017/notesDB'
}
// mongoose.connect("mongodb://localhost:27017/notesDB");
const itemsSchema ={
  name:String
};
const Item = mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"welecome to  the note pad "
});

const item2=new Item({
  name:"how about some coffee "
});
const item3=new Item({
  name:"thankyou,but i am  good "
});

// new scemhema
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List = mongoose.model("List",listSchema);



const defaultArry =[item1,item2,item3];

async function getItems(){
   const items= await Item.find({});
   return items;
}
 // const day= date.getdate();
app.get("/",function(req,res){


getItems().then(function(founditems){
if(founditems.length===0){

  Item.insertMany(defaultArry).then(function(){
    console.log("succesfully added data in db");
  })
  .catch(function(){
    console.log(err);
  });
  res.redirect("/");
}else{
   res.render("list",{listtitle:"Today",newlistItems:founditems});
}

});
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);
  List.findOne({name :customListName})
  .then((result) =>{
    if(!result){
      // console.log("yes");
      const list= new List({
        name: customListName,
        items:defaultArry
      });
      list.save();
     res.redirect("/"+ customListName);
    }else{
      // console.log("no");
      res.render("list",{listtitle:customListName,newlistItems:result.items})
    }
})
.catch((error)=>{
  console.log(error);
});
});


app.post("/",function(request,response){
const itemName =request.body.newItem;
const listName=request.body.list;

   const item = new Item({
     name:itemName
   });
   if(listName==="Today"){
     item.save();
     response.redirect("/");
   }else{
     List.findOne({name:listName})
     .then((found)=>{
       found.items.push(item);
       found.save();
       response.redirect("/"+ listName);
     })
     .catch((error)=>{
       console.log(error);
     });
   }

});



// app.post("/work",function(req,res){
// const item = req.body.newItem;
//   workitems.push(item);
//   res.redirect("/work");
// });

// app.get("/About",function(req,res){
//   res.render("about");
// })
//
// app.post("/About",function(req,res){
//   res.redirect("/about");
// });

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const checkedTitle =req.body.listName;
  if(checkedTitle==="Today"){
    Item.findByIdAndRemove(checkedItem).then(function(){
      console.log("deleted succesfully");
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:checkedTitle},{$pull:{items:{_id:checkedItem}}})
    .then((get)=>{
      res.redirect("/"+checkedTitle);
    })
    .catch((error)=>{
      console.log(error);
    });
  }
});

app.listen(3000,function(req,res){
  console.log("server is running on port 3000")
});
