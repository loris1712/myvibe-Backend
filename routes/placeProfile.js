const express = require('express');
const router = express.Router();

const {createPlaceProfile} = require('../mongodb/index')

router.post('/', async (req, resp) => {
    const profile = req.body;
    const saved = await createPlaceProfile(profile)
    resp.status(201).send({
      data: saved,
    });
})


module.exports = router