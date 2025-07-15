const express = require('express');
const router = express.Router();
const User = require('../models/User');
const users_header = require('../constants/headers')
const jwt = require("jsonwebtoken");
const { check_permissions } = require("../middleware/Auth")
require("dotenv").config();

const permission_auth = (req, res, next) =>
  check_permissions(req, res, next);

// GET all users
router.get('/', permission_auth, async (req, res) => {

  const columns = users_header;
  console.log('col', columns)
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  const startWith = (page - 1) * limit;

  const search = req.query.search?.trim();

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  // 🧪 Extract filters from req.query (exclude page, limit, search)
  const ignore = ['page', 'limit', 'search'];
  Object.entries(req.query).forEach(([key, value]) => {
    if (!ignore.includes(key) && value) {
      // Avoid adding `name`/`email` when search is active to prevent conflict
      if (search && (key === 'name' || key === 'email')) return;
      query[key] = value;
    }
  });
  console.log('search', query)
  const totalCount = await User.countDocuments(query);
  const users = await User.find(query, { password: 0 }, { updatedAt: 0, createdAt: 0, __v: 0 })
    .skip(startWith)
    .limit(limit)

    .lean();
  res.status(200).send({
    columns,
    data: users,
    count: totalCount
  })
});

// POST create new user
router.post('/', permission_auth, async (req, res) => {
  const newUser = new User(req.body);
  const savedUser = await newUser.save();
  res.json(savedUser);
});



//////////////////////////////////


router.post('/login', async (req, res, next) => {

  try {
    const { email, password } = req.body;
    const administrator = await User.findOne({
      email,
    });
    if (!administrator) {
      return res.status(404).send({ message: "User not exits" });
    }
    const isValidPassword = administrator.comparePassword(password);
    if (isValidPassword) {
      const tokens = administrator.getTokens();


      // set secure to true in production environment and same site

      const oneDay = 24 * 60 * 60 * 1000;
      const expirationDate = new Date(Date.now() + oneDay);

      res.cookie("Bearer", tokens.refreshToken, {
        httpOnly: true,
        path: "/",
        expires: expirationDate, // 15 min
        sameSite: "None",
        // secure: true

        
      });

      //      res.cookie("accessToken", tokens.accessToken, {

      //     path: "/",
      //     expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day

      //   });

      res.header("Access-Control-Allow-Credentials", "true");

      return res.status(200).send({
        message: "Successfully Login",
        accessToken: tokens.accessToken,
      });
    } else {
      return res.status(401).send({ message: "Unauthorized Login" });
    }
  } catch (err) {
    console.log('err', err)
    res.status(500).send({ message: "Something went wrong" });
  }
});



router.get('/swap', async (req, res) => {
  // if the status code is 401, frontend must logout immediately

  console.log('swap:::', req.headers.cookie, 'aa', req.headers.cookies)

  try {
    if (!req.headers.cookie) {
      return res.status(401).send({ message: "Required Cookie Not Found" });
    }
    const getBearerTokenFromCookie = (cookieHeader) => {
      if (!cookieHeader) return null;

      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      return cookies['Bearer'] || null;
    };
    const cookieHeader = req.headers.cookie;
    const token = getBearerTokenFromCookie(cookieHeader);

    const secret_key = token;
    // add algorithm to protect from being jwt header alg none
    // even tho default, the library will not verify with none algorihtm

    const payload = jwt.verify(secret_key, process.env.DEV_REFRESH_SECRET, {
      algorithms: ["HS256", "RS256"],
    });

    if (payload) {
      const administrator = await User.findOne({
        name: payload.name,

      });

     
      // The refresh jwt secret being exposed or User been diabled
      if (!administrator)
        return res.status(401).send({ message: "Cannot Refresh Right Now" });

      const { accessToken } = administrator.renewAccessToken();

      return res.status(200).send({
        message: "Successfully Swap Token",
        accessToken:  accessToken ,
      });
    }
    return res.status(401).send({ message: "Unauthoirzed Request" });
  } catch (error) {
    let errorCode = "";
    switch (error?.message) {
      case "jwt malformed":
        errorCode = "jwt malformed";
        break;
      case "jwt expired":
        errorCode = "jwt expired";
        break;
      default:
        errorCode = "Something not right";
        break;
    }
    // if something wrong with refresh token
    // we better delete this token to protect futhur suspicious activity
    // or to logout simply

    // res.clearCookie("Bearer");

    return res.status(401).send({ message: errorCode });
  }
});

router.post('/logout', async (req, res) => {
  try {
 
    if (!req.headers.cookie)
      return res.status(404).send({ message: "Information not enough" });

      const getBearerTokenFromCookie = (cookieHeader) => {
      if (!cookieHeader) return null;

      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      return cookies['Bearer'] || null;
    };
    const cookieHeader = req.headers.cookie;
    const token = getBearerTokenFromCookie(cookieHeader);

    const isRefreshExists = token;

    // the result might not return when jwt is malformed or expires or invalid signature
    // it will straight goes to 500 message code
    // this result only useful when you need to log activity
    // also act as a protected layer for malicious attack

    res.clearCookie("Bearer", { path: "/" }); // always delete cookie first before checking jwt

    const verifyResult = jwt.verify(isRefreshExists, process.env.DEV_REFRESH_SECRET);

    if (!verifyResult)
      return res.status(401).send({ message: "Cannot Verify Your Request" });

    return res.send({ message: "Successfully Logout" });
  } catch (err) {
    console.log('err', err)
    return res.status(500).send({ message: "Something went wrong" });
  }
});


module.exports = router;
