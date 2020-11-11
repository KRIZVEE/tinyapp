const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
let randId = ''

// this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs")
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users = {
  "userRandomId" : {
    id: "userRandomId",
    email: "user@example.com",
    password: "abcd"
  },
  "user2RandomId" : {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "purple-2-monkey-dinosaur"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!")
})

app.get("/urls.json", (req, res) => {
  // we are seeing the urlDB object as a string in the browser. So stringy is happening here by express automatically when calling .json method
  res.json(urlDatabase)
})

app.get("/urls", (req, res) => {
  // console.log('---inside /urls -------');
  // console.log('id : ', randId);
  // console.log('---inside /urls -------');
  for ( let key in users){
    if(key === randId){
      randId = users[key]
    }
  }
  // console.log('new rand id : ', randId);

  const templateVars = { user_id: randId, urls: urlDatabase };
  // const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  // console.log('templateVars : ',templateVars);
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  for ( let key in users){
    if(key === randId){
      randId = users[key]
    }
  }
  const templateVars = { user_id: randId };
  // const templateVars = { username: req.cookies['username'] };
  res.render("urls_new",templateVars)
})


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

function generateRandomString() {
  return Math.random().toString(36).slice(7);
}

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  let isEmailPresent = false;
  let isPasswordMatching = false;
  for ( let key in users){
    if(users[key].email === req.body.email){
      isEmailPresent = true;
      if(users[key].email === req.body.email && users[key].password === req.body.password ){
        isPasswordMatching = true;
        randId=users[key].id
      }
    }
  }
  if(!isEmailPresent){
    res.status(403);
    res.send('Response : Failure due to missing of existing-email in login page')
  }
  if(!isPasswordMatching){
    res.status(403);
    res.send('Response : Failure due to password mismatch in login page')
  }
  res.cookie('user_id', randId);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  console.log('b4 clearing REQUEST cookie : ', req.cookies);
  console.log('b4 clearing response cookie : ', res.cookies);
  res.clearCookie('user_id'); 
  console.log('after clearing REQUEST cookie : ', req.cookies);
  console.log('after clearing response cookie : ', res.cookies);
  res.redirect("/register")

})

app.get("/urls/:shortURL", (req, res) => {

  for ( let key in users){
    if(key === randId){
      randId = users[key]
    }
  }
  const templateVars = { user_id: randId, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // const templateVars = { username: req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  randId=''
  // console.log(templateVars);
  // for ( let key in users){
  //   if(key === randId){
  //     randId = users[key]
  //   }
  // }
  const templateVars = { user_id: randId };
  res.render("urls_register",templateVars)
})

const checkExistingEmail = function(email) {
  // console.log('users : ',users);
  // console.log('incoming email : ', email);
  for ( let key in users){
    if(users[key].email === email ){
      return email
    }
  }
  return false
}

app.post('/register', (req, res) => {
  // console.log('req.body.email',req.body.email);
  // console.log('req.body.password',req.body.password);
 
  if(req.body.email === '' || req.body.password === '')
  {
    res.status(400);
    res.send('Response : Failure due to missing user-email / password')
  }else if(req.body.email === checkExistingEmail(req.body.email)){
    res.status(400);
    res.send('Response : Failure due to existing email')
  }
  else{
    randId = generateRandomString();
    users[randId] = {
      id: randId,
      email: req.body.email,
      password: req.body.password
    }
    // console.log('---inside app.post -------');
    // console.log('random id : ',randId);
    // console.log('users.id : ',users[randId].id);
    // console.log('+++++');
    // console.log(users)
    // console.log('+++++');
    res.cookie('user_id',randId)
    res.redirect("/urls")
  }
})

app.get('/login', (req, res) => {
  for ( let key in users){
    if(key === randId){
      randId = users[key]
    }
  }
  const templateVars = { user_id: randId };
  res.render("urls_login",templateVars)
})

// the below code will not work as variable a is accessible only within /set page and not under /fetch page
/*
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });
*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})