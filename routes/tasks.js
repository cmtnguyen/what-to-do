const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const tasks = require('../controllers/tasks');
const { isLoggedIn, validateTask, verifyOwner } = require('../middleware');

router.route('/')
    .get(isLoggedIn, wrapAsync(tasks.index))
    .post(isLoggedIn, validateTask, wrapAsync(tasks.createNew))

router.get('/new', isLoggedIn, tasks.renderNew);

router.route('/:id') // make sure /:id is after /something
    .get(isLoggedIn, verifyOwner, wrapAsync(tasks.viewTask))
    .put(isLoggedIn, validateTask, verifyOwner, wrapAsync(tasks.updateTask))
    .delete(isLoggedIn, wrapAsync(tasks.deleteTask))

router.route('/:id/edit')
    .get(isLoggedIn, verifyOwner, wrapAsync(tasks.renderUpdate))
    .put(isLoggedIn, verifyOwner, wrapAsync(tasks.taskChecked))




module.exports = router;