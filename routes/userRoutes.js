const express = require('express');
const router = express.Router();
const User = require('../models/User');
const users_header =  require('../constants/headers')

// GET all users
router.get('/', async (req, res) => {

    const columns = users_header;
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;
    const startWith = (page - 1) * limit;
    const totalCount = await User.countDocuments();
    const users = await User.find({}, { updatedAt: 0, createdAt: 0, __v: 0 })
        .skip(startWith)
        .limit(limit)
        .sort({ posteddate: 1 })
        .lean();
    res.status(200).send({
        columns,
        data: users,
        count: totalCount
    })
});

// POST create new user
router.post('/', async (req, res) => {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.json(savedUser);
});

module.exports = router;
