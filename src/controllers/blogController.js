const Blog = require('../models/blogModel')
const Author = require('../models/authorModel')
const { default: mongoose } = require('mongoose')

const createBlog = async function(req,res){
    try {
        let data = req.body
        if(!data.title){
            return res.status(400).send({
                status: false,
                message : 'blog title is required'
            });
        }
        if(!data.body){
            return res.status(400).send({
                status: false,
                message : 'blog body is required'
            });
        }
        if(!data.authorId){
            return res.status(400).send({
                status: false,
                message : 'blog author id is required'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(data.authorId)){
            return res.status(400).send({
                status: false,
                message : 'blog author id is not valid'
            });
        }
        if(!data.tags){
            return res.status(400).send({
                status: false,
                message : 'blog tags is required'
            });
        }
        if(!data.category){
            return res.status(400).send({
                status: false,
                message : 'blog category is required'
            });
        }
        if(!data.subcategory){
            return res.status(400).send({
                status: false,
                message : 'blog subcategory is required'
            });
        }
        const author = await Author.findById(data.authorId);
        if(!author){
            return res.status(400).send({
                status: false,
                message : 'author id is not valid'
            });
        }

        if(author.authorId !== data.authorId) {
            return res.status(404).send({
                status: false,
                message : 'Wrong authorId'
            });
        }

        const blog = await Blog.create(data);
        res.status(201).send({
            status: true,
            message : 'Blog created successfully',
            data : blog
        })
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message : error.message
        })
    }
}

const blogs = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, isPublished: true}
        
        const {authorId, category, tags, subcategory} = req.query;

        if(authorId && mongoose.Types.ObjectId.isValid(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if(category) {
            filterQuery['category'] = category.trim()
        }

        if(tags) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = {$all: tagsArr}
        }
        
        if(subcategory) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = {$all: subcatArr}
        }
        

        const blogs = await Blog.find(filterQuery)
        
        if(Array.isArray(blogs) && blogs.length===0) {
            return res.status(404).send({
                status: false, 
                message: 'No blogs found'
            })
        }

        res.status(200).send({
            status: true, 
            message: 'Blogs fetched successfully', 
            data: blogs
        })
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const updateBlog = async function (req, res) {
    try {
        const blogId = req.params.blogId
        const authorIdFromToken = req.authorId
        
        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({
                status: false, 
                message: `${blogId} is not a valid blog id`
            });
        }

        if(!mongoose.Types.ObjectId.isValid(authorIdFromToken)) {
            return res.status(400).send({
                status: false, 
                message: `${authorIdFromToken} is not a valid token id`
            })
        }

        const blog = await Blog.findOne({_id: blogId, isDeleted: false })

        if(!blog) {
            return res.status(404).send({
                status: false, 
                message: `Blog not found`
            })
        }
        
        if(blog.authorId.toString() !== authorIdFromToken) {
            return res.status(403).send({
                status: false, 
                message: `Unauthorized access! You are not the author of this blog`
            });
        }

        const {title, body, tags, category, subcategory, isPublished} = req.body;

        const updatedBlogData = {}

        if(title) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['title'] = title
        }

        if(body) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['body'] = body
        }

        if(category) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['isPublished'] = isPublished
            updatedBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        
        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
            
            if(Array.isArray(tags)) {
                updatedBlogData['$addToSet']['tags'] = { $each: [...tags]}
            }
            if(typeof tags === "string") {
                updatedBlogData['$addToSet']['tags'] = tags
            }
        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
            if(Array.isArray(subcategory)) {
                updatedBlogData['$addToSet']['subcategory'] = { $each: [...subcategory]}
            }
            if(typeof subcategory === "string") {
                updatedBlogData['$addToSet']['subcategory'] = subcategory
            }
        }

        const updatedBlog = await Blog.findOneAndUpdate(
            {_id: blogId}, 
            updatedBlogData, 
            {new: true}
        )

        res.status(200).send({
            status: true, 
            message: 'Blog updated successfully', 
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).send({
            status: false, 
            message: error.message
        });
    }
}

const deleteBlogByID = async function (req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({
                status: false, 
                message: `${blogId} is not a valid blog id`
            })
            
        }

        if(!mongoose.Types.ObjectId.isValid(authorIdFromToken)) {
            return res.status(400).send({
                status: false, 
                message: `${authorIdFromToken} is not a valid token id`
            })
        }

        const blog = await Blog.findOne({_id: blogId, isDeleted: false })

        if(!blog) {
            return res.status(404).send({
                status: false, 
                message: `Blog not found`
            })
        }

        if(blog.authorId.toString() !== authorIdFromToken) {
            return res.status(403).send({
                status: false, 
                message: `Unauthorized access! You are not the author of this blog`
            });
        }

        await Blog.findOneAndUpdate(
                {_id: blogId}, 
                {$set: {isDeleted: true, deletedAt: new Date()}}
            )
        res.status(200).send({
            status: true,
        });
    } catch (error) {
        res.status(500).send({
            status: false, 
            message: error.message
        });
    }
}

const deleteBlogByParams = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, deletedAt: null}
        const queryParams = req.query
        const authorIdFromToken = req.authorId

        if(!mongoose.Types.ObjectId.isValid(authorIdFromToken)) {
            return res.status(404).send({
                status: false, 
                message: `${authorIdFromToken} is not a valid token id`
            })
        }

        const {authorId, category, tags, subcategory, isPublished} = queryParams

        if(authorId && mongoose.Types.ObjectId.isValid(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if(category) {
            filterQuery['category'] = category.trim()
        }

        if(isPublished) {
            filterQuery['isPublished'] = isPublished
        }

        if(tags) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = {$all: tagsArr}
        }
        
        if(subcategory) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = {$all: subcatArr}
        }

        const blogs = await Blog.find(filterQuery);

        if(Array.isArray(blogs) && blogs.length===0) {
            return res.status(404).send({
                status: false, 
                message: 'No matching blogs found'
            })
        }

        const idsOfBlogsToDelete = blogs.map(blog => {
            if(blog.authorId.toString() === authorIdFromToken) {
                return blog._id
            }
        })

        if(idsOfBlogsToDelete.length === 0) {
            return res.status(404).send({
                status: false, 
                message: 'No blogs found'
            })
        }

        await Blog.updateMany(
                {_id: {$in: idsOfBlogsToDelete}}, 
                {$set: {isDeleted: true, deletedAt: new Date()}}
            )

        res.status(200).send({
            status: true, 
            message: 'Blog(s) deleted successfully'
        });
    } catch (error) {
        res.status(500).send({
            status: false, 
            message: error.message
        });
    }
}

module.exports = {
    createBlog,
    blogs,
    updateBlog,
    deleteBlogByID,
    deleteBlogByParams
}