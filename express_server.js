const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/", (req, res) => {
  res.send("Hello!")
})

app.get("/urls.json", (req, res) => {
  // we are seeing the urlDB object as a string in the browser. So stringy is happening here by express automatically when calling .json method
  res.json(urlDatabase)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
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