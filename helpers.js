const {urlNewDatabase, users} = require("./infoDatabase")
const bcrypt = require('bcrypt')

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

const urlsForUser = function (id) {
  let resUrls = {};
  for (let key in urlNewDatabase) {
    if (id === urlNewDatabase[key].userID) {
      resUrls[key] = { longURL: urlNewDatabase[key].longURL, userID: id }
    }
  }
  return resUrls;
}

const isEmailPasswordMatches = function (email, password) {
  for (let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      return true;
    }
  }
  return false;
};

module.exports = {generateRandomString, checkEmailExistance, urlsForUser, isEmailPasswordMatches, bcrypt}