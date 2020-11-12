const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
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
};

const users = {
  "userRandomId": {
    id: "userRandomId",
    email: "user@example.com",
    password: "abcd"
  },
  "user2RandomId": {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "purple-2-monkey-dinosaur"
  },
  "ksf123": {
    id: "ksf123",
    email: "kashifrizvee",
    password: "simaab5amir"
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(7);
};

const checkEmailExistance = function(email) {
  for (let item in users) {
    if (users[item].email === email) {
      return true;
    }
  }
  return false;
};

const isEmailPasswordMatches = function(email, password) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
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
    templateVars = {
      userId: req.cookies.userId,
      email: users[req.cookies.userId].email,
      // urls: urlDatabase
      urls: urlNewDatabase
    };
  } else {
    templateVars = {
      userId: '',
      // urls: urlDatabase
      urls: urlNewDatabase
    };
  }
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {              // *** DONE *** //
  // for the first time user id not require
  let userId = '';
  res.render("urls_login", { userId });
});

app.get("/urls/new", (req, res) => {              // *** DONE *** //
  let templateVars = '';
  console.log('req.params : ',req.params);
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
      // longURL: urlDatabase[req.params.shortURL]
      longURL: urlNewDatabase[req.params.shortURL].longURL
    };
  } else {
    templateVars = {
      userId: '',
      shortURL: req.params.shortURL,
      // longURL: urlDatabase[req.params.shortURL]
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
      password
    };
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
    // res.redirect("/login")
  }
});

app.post("/urls/new", (req, res) => {              // *** DONE *** //
  let shortUrl = generateRandomString();
  console.log('longURL : ',req.body.longURL);
  if (req.cookies.userId) {
    // urlDatabase[shortUrl] = req.body.longURL
    urlNewDatabase[shortUrl] =
    {
      longURL: req.body.longURL,
      userId: req.cookies.userId
    };
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
  // delete urlDatabase[req.params.shortURL]
  delete urlNewDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  // urlDatabase[req.params.shortURL] = req.body.longURL;
  urlNewDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
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