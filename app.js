
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saumya:Testing123@cluster0.foadf.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your own TODO list"
});
const item2=new Item({
  name:"Hit + to add new item"
});
const item3=new Item({
  name:"<--Hit this to Delete an item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
/*
*/
app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({},(err,foundItems)=>{
  if(foundItems.length===0){
    Item.insertMany(defaultItems,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("succesfully saved items");
      }
      res.redirect("/");
    });
   
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
});

});
app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //create new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save((err,result)=>{
          res.redirect("/"+customListName);
        });
        
       // 
      }else{
        //show existing list 
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
   
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save((err,result)=>{
      res.redirect("/");
    });
   
  }else{
    List.findOne({name:listName},(err,foundList)=>{
      if(!foundList){
        console.log("list not found");
      }else{
      foundList.items.push(item);
      foundList.save((err,result)=>{
        res.redirect("/"+listName);
      });
      //console.log(foundList);
     
      }
    });
  }
});
  
/*
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
  */

app.post("/delete",(req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName ==="Today"){
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if(!err){
        
       console.log("successfully deleted checked item!!!!!");
       res.redirect("/");
      }
   });

  }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
  
})





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
