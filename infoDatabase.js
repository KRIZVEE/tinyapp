
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
    password: "$2b$10$V5Rieg8MbEXztcGBVi1RP.Xs9XqkqE7.b5YVsIib2Nu51aNFfmh1u"
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

module.exports = {urlNewDatabase, users};