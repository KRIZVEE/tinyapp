const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  isEmailPasswordMatches,
  bcrypt
} = require("./helpers");
const {
  urlNewDatabase,
  users
} = require("./infoDatabase");
const app = express();
const PORT = 8080; // default port 8080

// this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['tInYApP'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));

////////////////////////////////////////
//                                    //
//            GET METHODS             //
//                                    //
////////////////////////////////////////

app.get("/", (req, res) => {              
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {             
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
    res.send(`<html><body><div>You are a guest user. <p>I sincerely thank you to visit my page. </p>Please <a href="/register">register</a> or <a href="/login">login</a> to have a wonderful experience</div></body></html>\n`);
  }
});

app.get("/urls/new", (req, res) => {              // *** Need to work on task 1  *** //
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


app.get("/urls/:shortURL", (req, res) => {              
  let templateVars = '';
  if (!urlNewDatabase[req.params.shortURL] && req.session.userId) {
    res.send(`<html><body><div><p>Hi, You don't own this. Unfortunately you don't have the right to work on this. </p>Please go back to your homa page or click home <a href="/urls">🏡</a> </div></body></html>\n`);
  } else if (
    req.session.userId
    &&
    urlNewDatabase[req.params.shortURL].userID === req.session.userId
  ) {
    templateVars = {
      userId: req.session.userId,
      email: users[req.session.userId].email,
      shortURL: req.params.shortURL,
      longURL: urlNewDatabase[req.params.shortURL].longURL
    };
  } else if (req.session.userId) {
    res.send(`<html><body><div><p>Hi, You don't own this. Unfortunately you don't have the right to work on this. </p>Please go back to your homa page or click home <a href="/urls">🏡</a> </div></body></html>\n`);
  } else {
    req.session = null;
    res.send(`<html><body><div>You are a guest user. <p>I sincerely thank you to visit my page. </p>Please <a href="/register">register</a> or <a href="/login">login</a> to have a wonderful experience</div></body></html>\n`);
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {              
  let isShortUrlExist = false;
  for (let key in urlNewDatabase) {
    if (key === req.params.shortURL) {
      isShortUrlExist = true;
    }
  }
  if (isShortUrlExist) {
    res.redirect(urlNewDatabase[req.params.shortURL].longURL);
  } else {
    res.send(`<html><body><div>You are a guest user. <p>I sincerely thank you to visit my page. </p>Please <a href="/register">register</a> or <a href="/login">login</a> to have a wonderful experience</div></body></html>\n`);
  }
});

app.get('/login', (req, res) => {              
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    // for the first time user id not require
    let userId = '';
    res.render("urls_login", { userId });
  }
});

app.get("/register", (req, res) => {           
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    // for the first time user id not require
    let userId = '';
    res.render("urls_register", { userId });
  }
});

////////////////////////////////////////
//                                    //
//            POST METHODS            //
//                                    //
////////////////////////////////////////

app.post("/login", (req, res) => {              
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
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Response : Failure due to mismatch with email or password');
  }
});

app.post('/register', (req, res) => {             
  let isEmailExist = getUserByEmail(req.body.email, users);
  if (isEmailExist) {
    res.status(400);
    res.send('Response : Failure due to user email already exists. Please login');
    return;
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password');
    return;
  }
  const userRandId = generateRandomString();
  const { email, password } = req.body;
  users[userRandId] = {
    id: userRandId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.userId = userRandId;
  res.redirect('/urls');
});



/*
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
});*/

app.post("/urls", (req, res) => {              
  if (req.session.userId) {
    let shortUrl = generateRandomString();
    urlNewDatabase[shortUrl] =
    {
      longURL: req.body.longURL,
      userID: req.session.userId 
    };
    res.redirect(`/urls/${shortUrl}`);
  } else {
    req.session = null;
    res.send(`<html><body><div>You are a guest user. <p>I sincerely thank you to visit my page. </p>Please <a href="/register">register</a> or <a href="/login">login</a> to have a wonderful experience</div></body></html>\n`);
  }
});

app.post(`/urls/:shortURL/delete`, (req, res) => {              
  if (!urlNewDatabase[req.params.shortURL] && req.session.userId) {
    res.send(`<html><body><div><p>Hi, You don't own this. Unfortunately you don't have the right to work on this. </p>Please go back to your homa page or click home <a href="/urls">🏡</a> </div></body></html>\n`);
  } else if (req.session.userId) {
    delete urlNewDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    req.session = null;
    res.send(`<html><body><div>You are a guest user. <p>I sincerely thank you to visit my page. </p>Please <a href="/register">register</a> or <a href="/login">login</a> to have a wonderful experience</div></body></html>\n`);
  }
});

app.post("/urls/:shortURL", (req, res) => {             

  if (!urlNewDatabase[req.params.shortURL] && req.session.userId) {
    res.send(`<html><body><div><p>Hi, You don't own this. Unfortunately you don't have the right to work on this. </p>Please go back to your homa page or click home <a href="/urls">🏡</a> </div></body></html>\n`);
  } else if (req.session.userId && urlNewDatabase[req.params.shortURL].userID === req.session.userId) {
    urlNewDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    req.session = null;

    res.send(`<html><body><div><p>I sincerely thank you to visit my page. </p>You are not authorised to make change in url created by another user. Please \n register http://localhost:8080/register or \n login http://localhost:8080/login</p></div></body></html>\n`);
  }
});

app.post("/logout", (req, res) => {              
  req.session = null;
  res.redirect("/register");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


