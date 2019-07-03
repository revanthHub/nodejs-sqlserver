  
   
var express = require("express");
var bodyParser = require("body-parser"); 
var sql = require("mssql");
var app = express(); 
var ejs = require("ejs");
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json()); 
  
var routes = require('./routes/index');


app.set('view engine','ejs');
app.set('views', __dirname+ '/views');
app.engine('ejs',require('ejs').renderFile);

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("app listening at http://%s:%s", host, port)
});
   
       
var dbConfig = { 
    user: 'sa',
    password:'revanth100',
    server: 'CHAITHANYAB-PC\\MSSQLSERVER11', 
    database: 'users' 
    };   
  
    app.get('/', function(req, res, next){	
  
      res.render('user/home', {
        title: 'Home'
      }) ;sql.close(); 
    })   


    
    app.get('/users', function (req, res) {
      sql.connect(dbConfig, function() {
          var request = new sql.Request();
          var stringRequest = 'select * from usertable'; 
          request.query(stringRequest, function(err,rows) {
              if (err) {
                
                res.render('user/list', {
                  title: 'User List', 
                  data: ''
                })
              } else {
               
                res.render('user/list', {
                  title: 'User List', 
                  data: rows.recordset 
                  
                })
                
              }sql.close();
              
          });
      });
  })

  app.get('/groupid', function (req, res) {
    sql.connect(dbConfig, function() {
        var request = new sql.Request();
        var stringRequest = 'SELECT id,FirstName,LastName,Age FROM usertable INNER JOIN grouptable ON usertable.groupId = 1;'; 
        request.query(stringRequest, function(err,rows) {
          var data=rows.recordset;
            if (err) {
              
              res.render('user/list', {
                title: 'User List', 
                data: ''
              })
            } else {
             
              res.render('user/groupid', {
                title: 'User List', 
                data: rows.recordset 
                
              })
              // res.send(data)
            }sql.close();
            
        });
    });
})

app.use('/users', routes);



app.get('/users/add', function(req, res, next){	

	res.render('user/add', {
		title: 'Add New User',
	  groupId:'',
		FirstName: '',
    LastName: '',
    Age:'',	
	}) ;sql.close(); 
})   

     

app.post('/add',urlencodedParser, function(req , res){
  
  sql.connect(dbConfig, function() {
    var request = new sql.Request();
    
		
    request.query( "INSERT INTO [usertable] (groupId,FirstName,Lastname,Age) values(' "+req.body.groupId+"',' "+req.body.FirstName+"',' "+req.body.LastName + " ','"+ req.body.Age +"') ", function(err, data) {
      if (err) {
         
        res.send('<h2>ERROR:404--- Duplicates are not allowed</h2>');
       
        // res.render('user/add', {
        //   title: 'Add New User'
          
        // })
      } else {				
        
        
       
        res.send('<div><b>Data added Successfully</b><a href="/users"><input type="button" name="button" value="back" /></a></div>');
      }sql.close();
    });
});
     
                
});  


   
app.get('/users/edit/:id', function(req, res, next){
  sql.connect(dbConfig, function() {
    var request = new sql.Request();
    
  request.query('SELECT * FROM [usertable] WHERE id = '+req.params.id, function(err,rows){
    if(err) throw err
     var data=rows.recordset;
  
    if (data.length <= 0) {
     
      res.redirect('/users')
    }
    else { 
      res.render('user/edit', {
        title: 'Edit User', 
       
         
        id: data[0].id,
        groupId:data[0].groupId,
        FirstName: data[0].FirstName,
        LastName: data[0].LastName,
        Age: data[0].Age,
       					
      })
      
    }	sql.close();
  }) 
});
})          
     
app.post('/users/edit/:id',urlencodedParser, function(req, res, next) {
  sql.connect(dbConfig, function() { 
    var request = new sql.Request();
     
  request.query("UPDATE [usertable] SET groupId = '" + req.body.groupId  +  "' ,FirstName = '" + req.body.FirstName  +  "' , LastName=  '" + req.body.LastName + "',Age='" +req.body.Age + "' WHERE id = " +   req.params.id, function(err,rows) {
     
      if (err) {
       
        res.send(err);
      } else {
         
      
        res.send('<div><b>Data inserted Successfully</b><a href="/users"><input type="button" name="button" value="back" /></a></div>');

          
      }sql.close();
    });
  })         
})     




const poolPromise = new sql.ConnectionPool(dbConfig)
.connect()
.then(pool => {
  console.log('Connected to MSSQL')
  return pool
})
.catch(err => console.log('Database Connection Failed! Bad Config: ', err))

app.get('/users/delete/:id', async (req, res) => {
  try {
    var user={id:req.params.id};
    const pool = await poolPromise
    const result = await pool.request()
        .input('input_parameter', sql.Int, req.query.input_parameter)
        .query("delete from [usertable] where id="+req.params.id,user)      

        res.send('<div><b>Data deleted Successfully</b><a href="/users"><input type="button" name="button" value="back" /></a></div>'); 
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
})



module.exports = app;     