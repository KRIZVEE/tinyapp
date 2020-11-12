const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
let randId = ''

// this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs")
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const urlNewDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
}

function generateRandomString() {
  return Math.random().toString(36).slice(7);
}

const checkEmailExistance = function (email) {
  for (let item in users) {
    if (users[item].email === email) {
      return true;
    }
  }
  return false;
}

const isEmailPasswordMatches = function (email, password) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      return true;
    }
  }
  return false;
}

////////////////////////////////////////
//                                    //            
//            GET METHODS             //
//                                    //
////////////////////////////////////////

app.get("/register", (req, res) => {           // *** DONE *** //
  // for the first time user id not require
  let user_id = ''
  res.render("urls_register", { user_id })
})

app.get("/urls", (req, res) => {              // *** DONE *** //
  let templateVars = ''
  if (req.cookies.user_id) {
    templateVars = { 
      user_id: req.cookies.user_id, 
      email: users[req.cookies.user_id].email, 
      urls: urlDatabase };
  } else {
    templateVars = { 
      user_id: '', 
      urls: urlDatabase };
  }
  res.render("urls_index", templateVars)
})

app.get('/login', (req, res) => {              // *** DONE *** //
  // for the first time user id not require
  let user_id = ''
  res.render("urls_login", { user_id })
})

app.get("/urls/new", (req, res) => {              // *** DONE *** //
  let templateVars = ''
  if (req.cookies.user_id) {
    templateVars = {
      user_id: req.cookies.user_id,
      email: users[req.cookies.user_id].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
  } else {
    templateVars = {
      user_id: '',
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    }
  }
  res.render("urls_new", templateVars)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {              // *** DONE *** //
  let templateVars = ''
  if (req.cookies.user_id) {
    console.log('line ---- 123 ----');
    console.log('req.params : ',req.params);
    templateVars = {
      user_id: req.cookies.user_id,
      email: users[req.cookies.user_id].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
  } else {
    templateVars = {
      user_id: '',
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    }
  }
  res.render("urls_show", templateVars)
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
    res.send('Response : Failure due to user email already exists. Please login')
  } else if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password')
  } else {
    const userRandId = generateRandomString();
    const { email, password } = req.body;
    users[userRandId] = { 
      id: userRandId, 
      email, 
      password }
    res.cookie('user_id', userRandId)
    res.redirect('/urls')
  }
})

app.post("/login", (req, res) => {              // *** DONE *** //
  console.log('-----R B ---- : ',req.body);
  const { email, password } = req.body;
  console.log(email, password);
  console.log('users : ', users);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Response : Failure due to missing email or password')
  } else if (isEmailPasswordMatches(email, password)) {
    console.log('-----inside line 169------');
    let user_id = ''
    for (let key in users) {
      if (users[key].email === email) {
        user_id = key;
      }
    }
    res.cookie('user_id', user_id);
    res.redirect("/urls")
  } else {
    res.status(400);
    res.send('Response : Failure due to mismatch with email or password')
    // res.redirect("/login")
  }
})

app.post("/urls/new", (req, res) => {              // *** DONE *** //
  let shortUrl = generateRandomString();
  if(req.cookies.user_id){
    urlDatabase[shortUrl] = req.body.longURL
    res.redirect(`/urls/${shortUrl}`)
  }else{
    urlDatabase[shortUrl] = req.body.longURL
    res.redirect(`/urls/${shortUrl}`)
  }
})

// app.post("/urls", (req, res) => {
//   let shortURL = generateRandomString();
//   urlDatabase[shortURL] = req.body.longURL;
//   res.redirect(`/urls/${shortURL}`)
// });

app.post(`/urls/:shortURL/delete`, (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {

  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/register")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

//--------------


app.get("/", (req, res) => {
  res.send("Hello!")
})

app.get("/urls.json", (req, res) => {
  // we are seeing the urlDB object as a string in the browser. 
  //So stringy is happening here by express automatically when calling .json method
  res.json(urlDatabase)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})