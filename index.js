// Course Ninja Main JS File!!!

var express = require("express");
var app = express();

var bodyParser = require("body-parser"),
	session  = require('express-session'),
	mysql = require('mysql');

const PORT = process.env.PORT || 3000

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); 
app.use(session({
	secret: 'wouldrathernot',
	resave: true,
	saveUninitialized: true
 } ));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ninyaninya",
  database : "auth"
});
// change that to proper db once source sql has been run

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

//middleware used on every route call 
app.use(function(req, res, next){
	res.locals.user = req.session.username;
	res.locals.message = req.session.message;
	delete req.session.message;
	next();
});

app.get("/", function(req, res){
	res.render("index");
});

app.post('/login', function(req, res){
    var name= req.body.username;
    var pass= req.body.password;
    var sql="SELECT id, user_name FROM users WHERE user_name = '" + name + "' and password = '" + pass + "'";  
	
    con.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.username = results[0].user_name;
            res.redirect('/');
		} else {
			sql = "SELECT user_name FROM users WHERE user_name = '" + name + "';";
			con.query(sql, function(err, results){ 
				if(results.length){
					req.session.message = "Incorrect password. Please try again."
					res.redirect("/");
				} else {
					req.session.message = "Username not found. Please try again."
					res.redirect("/");
				}
			});			
		}
	});
});

app.post('/logout', function(req, res){
	req.session.message = "You have been logged out";
	req.session.userId = "";
	req.session.username = "";
	res.redirect('/');
});

app.get("/register", function(req, res){
	res.render("register");
});

app.get("/login", function(req, res){
	res.redirect("/");
});

app.post("/register", function(req, res){
	var email = req.body.email
	var name = req.body.username;
    var pass = req.body.password;
	var pass2 = req.body.password2;
	// validate and/or escape values
	if(pass === pass2){
		var sql="INSERT INTO users (user_name, password) VALUES ('" + name + "','" + pass + "');";  
		con.query(sql, function(err, results){      
			if(err){
				req.session.message = "Database could not be reached";
				res.redirect('/register');
			} else {
				req.session.message = "Account has been created.";
				res.redirect("/");
			}
		});
	} else {
		req.session.message = "Passwords do not match!";
		res.redirect("/register");
	}
});

app.get("/admin", isLoggedIn, function(req, res){
	res.send("You passed the test!");
});

function isLoggedIn(req, res, next){
	if(req.session.username){
		next();
	} else {
		res.send("You must be logged in to do that!");
	}
}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));