'use strict';

const express = require('express');

const client = require('./client');


const router = module.exports = express.Router();

router.use(client);
