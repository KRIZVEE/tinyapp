const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt')
// const popup = require('popups');

const app = express();
const PORT = 8080; // default port 8080

// this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const urlNewDatabase = {
  'b2xVn2': { longURL: "https://www.tsn.ca", userID: "userRandomId" },
  '9sm5xK': { longURL: "https://www.google.ca", userID: "user2RandomId" },
  'abc123': { longURL: "https://www.bing.ca", userID: "ksf123" },
  'pqr456': { longURL: "https://www.yahoo.ca", userID: "ksf123" },
  'xyz345': { longURL: "https://www.ibm.ca", userID: "ksf123" },
  'jkl789': { longURL: "https://www.apple.ca", userID: "userRandomId" },
};

const users = {
  "userRandomId": {
    id: "userRandomId",
    email: "user@example.com",
    password: "$2b$10$PDRvV0xE0mb7q.ZJyYSVkOTZ7Hl7IvMHhA71dRKuH3sb6ZgBSjS8O"
    //abcd
  },
  "user2RandomId": {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "$2b$10$8pifghKwvIw1RzgSVO3gseCRLJjHbt1II4Zi/zdDkIbQ6Rkf83Nu6"    
    //purple-2-monkey-dinosaur
  },
  "ksf123": {
    id: "ksf123",
    email: "kashifrizvee",
    password: "$2b$10$7R7GZbxo6LAIFMaLXt0qlOMdt5QA4.GPIp4yKfJGp4D.ckLDdqolS"
    // password: "simaab5amir"
  }
};

const generateRandomString = function () {
  return Math.random().toString(36).slice(7);
};

const checkEmailExistance = function (email) {
  for (let item in users) {
    if (users[item].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let resUrls = {};
  for(let key in urlNewDatabase) {    
    if(id === urlNewDatabase[key].userID){
      resUrls[key] = {longURL: urlNewDatabase[key].longURL, userID: id}
    }
  }
  return resUrls;
}
//    // bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

const isEmailPasswordMatches = function (email, password) {
  console.log('---line 71---');
  console.log('password : ',password);
  for (let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password,users[key].password)){
      return true;
    }
  }
  return false;
};

////////////////////////////////////////
//                                    //
//            GET METHODS             //
//                                    //
////////////////////////////////////////

app.get("/register", (req, res) => {           // *** DONE *** //
  // for the first time user id not require
  let userId = '';
  res.render("urls_register", { userId });
});


app.get("/urls", (req, res) => {              // *** DONE *** //
  let templateVars = '';
  if (req.cookies.userId) {
    let currentUserId = req.cookies.userId;    
    let urlsUserId = urlsForUser(currentUserId);
    // console.log(' urlsUserId : ', urlsUserId);
    templateVars = {
      userId: req.cookies.userId,
      email: users[req.cookies.userId].email,
      urls: urlsUserId
      // urls: urlNewDatabase
    };
    res.render("urls_index", templateVars);

  } else {

    // let guestUserPrompt = Window.
    // res.send('Please login or register first if you want to see the tiny urls')
    // window.alert('5');
  //   popup.alert({
  //     content: 'Please login or register first if you want to see the tiny urls!'
  // });
    let userId = '';

    res.render("urls_login", { userId });
  }
});

app.get('/login', (req, res) => {              // *** DONE *** //
  // for the first time user id not require
  let userId = '';
  res.render("urls_login", { userId });
});

app.get("/urls/new", (req, res) => {              // *** DONE *** //
  let templateVars = '';
  console.log('req.params : ', req.params);
  if (req.cookies.userId) {
    templateVars = {
      userId: req.cookies.userId,
      email: users[req.cookies.userId].email
    };
  } else {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {              // *** DONE *** //
  const longURL = urlNewDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {              // *** DONE *** //
  let templateVars = '';
  if (req.cookies.userId) {
    templateVars = {
      userId: req.cookies.userId,
      email: users[req.cookies.userId].email,
      shortURL: req.params.shortURL,
      longURL: urlNewDatabase[req.params.shortURL].longURL
    };
  } else {
    templateVars = {
      userId: '',
      shortURL: req.params.shortURL,
      longURL: urlNewDatabase[req.params.shortURL].longURL
    };
  }
  res.render("urls_show", templateVars);
});

////////////////////////////////////////
//                                    //
//            POST METHODS            //
//                                    //
////////////////////////////////////////

app.post('/register', (req, res) => {              // *** DONE *** //
  console.log('---req.body---', req.body);
  // main issue on my register page whent ries to login the pages is acting weirdly
  let isEmailExist = checkEmailExistance(req.body.email);
  if (isEmailExist) {
    res.status(400);
    res.send('Response : Failure due to user email already exists. Please login');
  } else if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password');
  } else {
    const userRandId = generateRandomString();
    const { email, password } = req.body;
    users[userRandId] = {
      id: userRandId,
      email,
      password : bcrypt.hashSync(password,10)
    };
    console.log('+++++++++');
    console.log(' new user : ',users[userRandId]);
    console.log('+++++++++');

    res.cookie('userId', userRandId);
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {              // *** DONE *** //
  console.log('-----R B ---- : ', req.body);
  const { email, password } = req.body;
  console.log(email, password);
  console.log('users : ', users);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password');

  } else if (isEmailPasswordMatches(email, password)) {
    console.log('-----inside line 169------');
    let userId = '';
    for (let key in users) {
      if (users[key].email === email) {
        userId = key;
      }
    }
    res.cookie('userId', userId);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Response : Failure due to mismatch with email or password');
  }
});

app.post("/urls/new", (req, res) => {              // *** DONE *** //
  let shortUrl = generateRandomString();
  console.log('longURL : ', req.body.longURL);
  if (req.cookies.userId) {
    urlNewDatabase[shortUrl] =
    {
      longURL: req.body.longURL,
      userID: req.cookies.userId
    }; 
    console.log('218');  
    console.log('urlNewDatabase : ', urlNewDatabase); 
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.redirect("/login");
  }
});

// app.post("/urls", (req, res) => {
//   let shortURL = generateRandomString();
//   urlDatabase[shortURL] = req.body.longURL;
//   res.redirect(`/urls/${shortURL}`)
// });

app.post(`/urls/:shortURL/delete`, (req, res) => {              // *** DONE *** //
  if(req.cookies.userId){
  console.log('line 236');
  delete urlNewDatabase[req.params.shortURL];
  res.redirect("/urls");
}
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.cookies.userId){
  urlNewDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post("/logout", (req, res) => {              // *** DONE *** //
  res.clearCookie('userId');
  res.redirect("/register");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//--------------


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  // we are seeing the urlDB object as a string in the browser.
  //So stringy is happening here by express automatically when calling .json method
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});