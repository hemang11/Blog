var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var bcrypt = require('bcryptjs');
var mongoose=require("mongoose");
var passport=require("passport");
var LocalStrategy = require('passport-local').Strategy;
var methodOverride=require("method-override");
app.use(express.static("css"));  // static files in css ....
app.use(methodOverride("_method"));

//mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});// ** this mongodb connects to local mongodb server **
mongoose.connect('mongodb+srv://Hemang:<Password of mongoDB>@blogs-uq9an.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true});
// this connect method uses mongodb atlas which is a hosting database...
app.use(bodyParser.urlencoded({extended:true}));
mongoose.set('useFindAndModify', false);

// 1 model for blogs
var blogSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type:Date,default:Date.now}
});

var Blog=mongoose.model("Blog",blogSchema);

// 2 model for login system
var UserSchema=new mongoose.Schema({
	username:String,
	password:String
});

var User=mongoose.model("User",UserSchema);

// passport
 
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
	  // password match...
	  bcrypt.compare(password,user.password,function(err,isMatch){
		  if (err) throw err;
		  if (isMatch) {
            return done(null, user);
          }  else {
            return done(null, false, { message: 'Password incorrect' });
          }
	  });
    });
  }
));

 passport.serializeUser(function(user, done) {
  done(null, user.id);
});

 passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Express session
app.use(require("express-session")({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// body parser...
app.use(express.urlencoded({ extended: true }));

//Routes.......................

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

 app.get("/blogs/new", ensureAuthenticated,function(req,res){   // contains the form
      res.render("new.ejs");	 
 });

app.get("/blogs/:id", ensureAuthenticated,function(req,res){
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
app.get("/blogs/:id/edit", ensureAuthenticated,function(req,res){
	Blog.findById(req.params.id,function(err,edit){
		if(err) console.log("error");
		else{
			res.render("edit.ejs",{blogs:edit})
		}
	});
});
// main update happen here
app.put("/blogs/:id", ensureAuthenticated,function(req,res){
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

app.delete("/blogs/:id", ensureAuthenticated,function(req,res){
   	    Blog.findByIdAndRemove(req.params.id,function(err,deleted){
		if(err) console.log("error");
		else{
			res.redirect("/blogs");
		}
	});
});

// Auth routes===========
app.get("/register",forwardAuthenticated,function(req,res){
	res.render("register.ejs");
});

app.post("/register",function(req,res){
    var username=req.body.username;
	var password=req.body.password;
	User.findOne({username:username},function(err,user_found){
		if(err) throw err;
		else if(user_found){
			res.redirect("/register");
		}
		else{ bcrypt.genSalt(10, function(err, salt){
               bcrypt.hash(password, salt, function(err, hash){
               if (err) throw err;
                   var pass=hash;
				   User.create({username:username,password:pass},function(err,user){
		           console.log("successfully registered");
			       res.redirect("/login");
	              });
			   });
			})};	
	});
});

app.get("/login",forwardAuthenticated,function(req,res){
	res.render("login.ejs");
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/blogs',
    failureRedirect: '/login'
  })(req, res, next);
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});
 
// config auth
  function forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/blogs');      
  };

 function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };

// Server Side.........
var PORT=process.env.PORT || 3000;
app.listen(PORT,process.env.IP,function(){  // can run on any port
	console.log("Our Blog Server has started");
});
