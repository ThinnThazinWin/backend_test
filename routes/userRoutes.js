const express = require('express');
const router = express.Router();
const User = require('../models/User');
const users_header = require('../constants/headers')

// GET all users
router.get('/', async (req, res) => {

    const columns = users_header;
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
    const filterKeysToIgnore = ['page', 'limit', 'search'];
    Object.entries(req.query).forEach(([key, value]) => {
        if (!filterKeysToIgnore.includes(key) && value) {
            query[key] = value;
        }
    });
     const totalCount = await User.countDocuments(query);
    const users = await User.find(query, { updatedAt: 0, createdAt: 0, __v: 0 })
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
router.post('/', async (req, res) => {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.json(savedUser);
});

module.exports = router;
