const express = require('express');
const router = express.Router();

const {
    createAuthor,
    login
} = require('../controllers/authorController')
const {
    createBlog,
    blogs,
    updateBlog,
    deleteBlogByID,
    deleteBlogByParams
} = require('../controllers/blogController')
const { auth } = require('../middlewares/auth')

router.get('/', (req, res) => {
    res.send('Hello World!');
})

// Author routes
router.post('/authors', createAuthor);
router.post('/login', login);

// Blog routes
router.post('/blogs', auth, createBlog);
router.get('/blogs', auth, blogs);
router.put('/blogs/:blogId', auth, updateBlog);
router.delete('/blogs/:blogId', auth, deleteBlogByID);
router.delete('/blogs', auth, deleteBlogByParams);

module.exports = router;