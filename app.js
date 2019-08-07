var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var methodOverride=require("method-override");
app.use(express.static("css"));  // static files in css ....
app.use(methodOverride("_method"));

// mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true}); ** this mongodb connects to local mongodb server **
mongoose.connect('mongodb+srv://Hemang:Hemang%40123@blogs-uq9an.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true});
// this connect method uses mongodb atlas which is a hosting database...
app.use(bodyParser.urlencoded({extended:true}));
mongoose.set('useFindAndModify', false);

var blogSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type:Date,default:Date.now}
});

var Blog=mongoose.model("Blog",blogSchema);

app.get("/",function(req,res){
   res.redirect("/blogs");	
});

app.get("/blogs",function(req,res){
	// find info from dbs and display them
	Blog.find({},function(err,blog_create){
		if(err) console.log("error");
		else{
			res.render("index.ejs",{blog_create:blog_create});
		}
	});
});

 app.get("/blogs/new",function(req,res){   // contains the form
      res.render("new.ejs");	 
 });

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,found_blog){
		if(err) console.log("error");
		else{
			 res.render("show.ejs",{found_blog:found_blog});
		}
	});
});

app.post("/blogs",function(req,res){
	var title=req.body.name;
	var image=req.body.image;
	var body=req.body.description;
	var new_blog={title:title,image:image,body:body};
	Blog.create(new_blog,function(err,newblog){
		if(err) console.log("error");
		else{
			res.redirect("/blogs");
		}
	});
});

// this will take you to a form previously filled to edit
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,edit){
		if(err) console.log("error");
		else{
			res.render("edit.ejs",{blogs:edit})
		}
	});
});
// main update happen here
app.put("/blogs/:id",function(req,res){
	var title=req.body.name;
	var image=req.body.image;
	var body=req.body.description;
	var edit_blog={title:title,image:image,body:body};
	Blog.findByIdAndUpdate(req.params.id,edit_blog,function(err,edited){  // new mongodb function for update...
		                                                                 // here edit_block as 2 arg because it cont all edited data
			if(err) console.log("error");
		else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

app.delete("/blogs/:id",function(req,res){
   	    Blog.findByIdAndRemove(req.params.id,function(err,deleted){
		if(err) console.log("error");
		else{
			res.redirect("/blogs");
		}
	});
});

// Blog.create({
//	title:"Jee",
//	image:"https://www.impactbnd.com/hubfs/blog-image-uploads/9_Blog_Layout_Best_Practices_From_2017.jpg",
//	body:"Here comes our first BLog!!!"
//});

app.listen(process.env.PORT,process.env.IP,function(){  // can run on any port
	console.log("Our Blog Server has started");
});