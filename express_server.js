const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const { 
        generateRandomString, 
        checkEmailExistance, 
        urlsForUser, 
        isEmailPasswordMatches,
        bcrypt
      } = require("./helpers")
const { 
        urlNewDatabase, 
        users
      } = require("./infoDatabase")
const app = express();
const PORT = 8080; // default port 8080

// this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['tInYApP'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({ extended: true }));

////////////////////////////////////////
//                                    //
//            GET METHODS             //
//                                    //
////////////////////////////////////////

app.get("/register", (req, res) => {           // *** DONE *** //
  // for the first time user id not require
  res.render("urls_register", { userId: null });
});


app.get("/urls", (req, res) => {              // *** DONE *** //
  let templateVars = '';//userId
  if (req.session.userId) {
    let currentUserId = req.session.userId;
    let urlsUserId = urlsForUser(currentUserId);
    templateVars = {
      userId: req.session.userId,
      email: users[req.session.userId].email,
      urls: urlsUserId
    };
    res.render("urls_index", templateVars);
  } else {
    // res.send('Please login or register first if you want to see the tiny urls')
    // window.alert('5');
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
  if (req.session.userId) {
    templateVars = {
      userId: req.session.userId,
      email: users[req.session.userId].email
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
  if (req.session.userId) {
    templateVars = {
      userId: req.session.userId,
      email: users[req.session.userId].email,
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
  let isEmailExist = checkEmailExistance(req.body.email);
  if (isEmailExist) {
    res.status(400);
    res.send('Response : Failure due to user email already exists. Please login');
    return
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password');
    return
  } 
  const userRandId = generateRandomString();
  const { email, password } = req.body;
  users[userRandId] = {
    id: userRandId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.userId = userRandId;

  // res.cookie('userId', userRandId);
  res.redirect('/urls');

});

app.post("/login", (req, res) => {              // *** DONE *** //
  console.log('----- app post login R B ---- : ', req.body);
  const { email, password } = req.body;
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password');

  } else if (isEmailPasswordMatches(email, password)) {
    let userId = '';
    for (let key in users) {
      if (users[key].email === email) {
        userId = key;
      }
    }
    req.session.userId = userId;
    // res.cookie('userId', userId);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Response : Failure due to mismatch with email or password');
  }
});

app.post("/urls/new", (req, res) => {              // *** DONE *** //
  let shortUrl = generateRandomString();//req.session.userId
  if (req.session.userId) {
    urlNewDatabase[shortUrl] =
    {
      longURL: req.body.longURL,
      userID: req.session.userId //session
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
  if (req.session.userId) {
    delete urlNewDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    urlNewDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post("/logout", (req, res) => {              // *** DONE *** //
  // res.clearCookie('userId');
  req.session = null
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

