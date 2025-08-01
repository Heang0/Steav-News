const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const multer = require("multer");
const fs = require('fs').promises;

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const port = process.env.PORT || 5000;

// --- CONFIGURE CLOUDINARY ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// --- END CLOUDINARY CONFIG ---


// Middleware setup - Using express's built-in body parsers
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));


// MongoDB connection details
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "kpop_news";
const collectionName = "articles";

// Define accepted categories
const CATEGORIES = ["កម្សាន្ត", "សង្គម", "កីឡា", "ពិភពលោក"];

// --- Authentication Middleware ---
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin6232';

const isAuthenticated = (req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    if (sessionId === process.env.ADMIN_SESSION_ID) {
        next(); // User is authenticated
    } else {
        res.status(401).json({ message: "Unauthorized: Invalid session ID." });
    }
};

// --- MULTER CONFIGURATION FOR THUMBNAIL WITH CLOUDINARY STORAGE ---
const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kpop_news_thumbnails",
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `thumbnail-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});
// Multer instance for thumbnail with file size limit and error handling
const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: { fileSize: 1024 * 1024 * 5 } // 5 MB file size limit
}).single('thumbnail');


// --- MULTER CONFIGURATION FOR INLINE IMAGE UPLOADS WITH CLOUDINARY STORAGE ---
const inlineImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kpop_news_inline_images",
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `inline-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});
// Multer instance for inline image with file size limit and error handling
const uploadInlineImage = multer({
    storage: inlineImageStorage,
    limits: { fileSize: 1024 * 1024 * 5 } // 5 MB file size limit
}).single('inlineImage');


// Function to connect to MongoDB and start the server
async function startServer() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db(dbName);
        const newsCollection = db.collection(collectionName);

        // --- NEW: Explicit route for robots.txt to ensure it's always served 200 OK ---
        app.get("/robots.txt", async (req, res) => {
            try {
                const robotsPath = path.join(__dirname, "../public", "robots.txt");
                await fs.access(robotsPath); // Check if file exists
                res.status(200).sendFile(robotsPath);
            } catch (err) {
                console.warn("robots.txt not found or accessible:", err.message);
                res.status(404).send("robots.txt not found"); // Or send an empty file, depending on desired behavior
            }
        });


        // Route to serve your main HTML page
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../public", "index.html"));
        });

        // --- IMPORTANT: Dynamic Route for Article Detail Pages (for Open Graph Meta Tags) ---
        // This route MUST be placed BEFORE `app.use(express.static(...))` for '/article.html'
        app.get("/article.html", async (req, res) => {
            try {
                const articleId = req.query.id;
                if (!articleId) {
                    return res.status(400).send("Article ID is required.");
                }
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).send("Invalid Article ID format.");
                }

                const article = await newsCollection.findOne({ _id: new ObjectId(articleId) });

                if (!article) {
                    // Serve a generic 404 HTML page if the article is not found
                    return res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
                }

                // Read the article.html template
                let htmlContent = await fs.readFile(path.join(__dirname, "../public", "article.html"), 'utf8');

                // Construct full absolute URL for Open Graph image and URL
                const protocol = req.protocol || 'http';
                const host = req.headers.host;

                const absoluteImageUrl = article.image ? article.image : `${protocol}://${host}/images/default_og_image.jpg`;
                const absoluteArticleUrl = `${protocol}://${host}/article.html?id=${article._id}`;

                const plainTextContent = article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "Read the latest K-POP news here.";

                // Replace placeholders with actual article data
                htmlContent = htmlContent.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${article.title || "K-POP News Article"}">`);
                htmlContent = htmlContent.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${plainTextContent}">`);
                htmlContent = htmlContent.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${absoluteImageUrl}">`);
                htmlContent = htmlContent.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${absoluteArticleUrl}">`);

                // Also update Twitter card meta tags
                htmlContent = htmlContent.replace(/<meta name="twitter:card" content="[^"]*">/, `<meta name="twitter:card" content="summary_large_image">`);
                htmlContent = htmlContent.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${article.title || "K-POP News Article"}">`);
                htmlContent = htmlContent.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${plainTextContent}">`);
                htmlContent = htmlContent.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${absoluteImageUrl}">`);

                // Send the modified HTML
                res.status(200).send(htmlContent);

            } catch (err) {
                console.error("❌ Error serving dynamic article page:", err);
                res.status(500).send("Failed to load article page.");
            }
        });

        // --- Serve static files from the 'public' directory ---
        // This line MUST come AFTER any dynamic routes that might serve files from 'public'
       // Serve robots.txt for Facebook crawler
app.get("/robots.txt", async (req, res) => {
  try {
    const robotsPath = path.join(__dirname, "../public", "robots.txt");
    await fs.access(robotsPath); // ensure it exists
    res.status(200).sendFile(robotsPath);
  } catch (err) {
    console.warn("robots.txt not found:", err.message);
    res.status(404).send("robots.txt not found");
  }
});

// Serve static files after dynamic routes
app.use(express.static(path.join(__dirname, "../public")));



        // --- Authentication Endpoint ---
        app.post('/api/login', (req, res) => {
            const { username, password } = req.body;
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                const sessionId = process.env.ADMIN_SESSION_ID || 'static-admin-session-id';
                res.status(200).json({ message: 'Login successful', sessionId: sessionId });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });

        // --- API Route to Get All Articles (Newest First) ---
        // MODIFIED: Added search, category, tag filtering, limit, and offset for pagination
        app.get("/api/articles", async (req, res) => {
            try {
                const { search, category, tag, limit, offset } = req.query;
                const query = {};

                // Ensure search is a string before using it in regex
                const processedSearch = typeof search === 'string' ? search.trim() : '';

                if (processedSearch) {
                    query.$or = [
                        { title: { $regex: processedSearch, $options: 'i' } },
                        { content: { $regex: processedSearch, $options: 'i' } }
                    ];
                }
                if (category) {
                    query.category = category;
                }
                if (tag) {
                    query.tags = tag; // Matches if the tag exists in the tags array
                }

                let articlesQuery = newsCollection.find(query).sort({ createdAt: -1 });

                if (limit) {
                    articlesQuery = articlesQuery.limit(parseInt(limit));
                }
                if (offset) {
                    articlesQuery = articlesQuery.skip(parseInt(offset));
                }

                const articles = await articlesQuery.toArray();
                res.status(200).json(articles);
            } catch (err) {
                console.error("❌ Error fetching articles:", err);
                res.status(500).json({ error: "Failed to fetch articles" });
            }
        });

        // --- NEW API Route: Get Total Article Count (for pagination) ---
        app.get("/api/articles/count", async (req, res) => {
            try {
                const { search, category, tag } = req.query;
                const query = {};

                // --- START DEBUGGING LOGS ---
                console.log("DEBUG: Received query parameters for /api/articles/count:", req.query);
                // --- END DEBUGGING LOGS ---

                // Ensure search is a string before using it in regex
                const processedSearch = typeof search === 'string' ? search.trim() : '';

                if (processedSearch) {
                    query.$or = [
                        { title: { $regex: processedSearch, $options: 'i' } },
                        { content: { $regex: processedSearch, $options: 'i' } }
                    ];
                }
                if (category) {
                    query.category = category;
                }
                // No change needed for tag as it's not directly used in regex
                if (tag) {
                    query.tags = tag;
                }
                
                // --- START DEBUGGING LOGS ---
                console.log("DEBUG: Constructed MongoDB query for count:", JSON.stringify(query));
                // --- END DEBUGGING LOGS ---

                const count = await newsCollection.countDocuments(query);
                res.status(200).json({ count });
            } catch (err) {
                console.error("❌ Error fetching article count:", err);
                res.status(500).json({ error: "Failed to fetch article count" });
            }
        });

        // --- NEW API Route: Get one latest article for each specified category for homepage previews ---
        app.get("/api/categories/homepage-previews", async (req, res) => {
            try {
                const categoryArticles = [];
                for (const category of CATEGORIES) {
                    const article = await newsCollection.findOne(
                        { category: category },
                        { sort: { createdAt: -1 } } // Get the latest one
                    );
                    if (article) {
                        categoryArticles.push(article);
                    }
                }
                res.status(200).json(categoryArticles);
            } catch (err) {
                console.error("❌ Error fetching category homepage previews:", err);
                res.status(500).json({ error: "Failed to fetch category previews" });
            }
        });


        // --- API Route to Get Trending Articles (Newest First) ---
        app.get("/api/trending", async (req, res) => {
            try {
                const trendingArticles = await newsCollection.find({ trending: true })
                                                              .sort({ createdAt: -1 })
                                                              .limit(5)
                                                              .toArray();
                res.status(200).json(trendingArticles);
            }
            catch (err) {
                console.error("❌ Error fetching trending articles:", err);
                res.status(500).json({ error: "Failed to fetch trending articles" });
            }
        });

        // --- API Route to Get a Single Article by ID ---
        // MODIFIED: Added views increment
        app.get("/api/articles/:id", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                // Find article and increment views counter
                const article = await newsCollection.findOneAndUpdate(
                    { _id: new ObjectId(articleId) },
                    { $inc: { views: 1 } }, // Increment 'views' by 1
                    { returnDocument: 'after' } // Return the updated document
                );
                if (!article.value) { // For findOneAndUpdate, the updated document is in 'value'
                    return res.status(404).json({ error: "Article not found" });
                }
                res.status(200).json(article.value);
            }
            catch (err) {
                console.error("❌ Error fetching single article:", err);
                res.status(500).json({ error: "Failed to fetch article" });
            }
        });

        // --- API Route to Add New Article (Authentication Required) ---
        // MODIFIED: Added category, tags, and views initialization
        app.post("/api/news", isAuthenticated, (req, res, next) => { // Added multer error handling middleware
            uploadThumbnail(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    return res.status(500).json({ error: `File upload error: ${err.message}` });
                } else if (err) {
                    return res.status(500).json({ error: `An unknown error occurred during upload: ${err.message}` });
                }
                next(); // Proceed to actual route handler
            });
        }, async (req, res) => {
            try {
                const { title, date, content, trending, imageUrl: bodyImageUrl, category } = req.body; // Ensure category is destructured
                let imagePath = "/images/default_og_image.jpg"; // Default fallback if no file or external URL provided

                if (req.file) {
                    imagePath = req.file.path; // Multer-Cloudinary puts the Cloudinary URL here
                } else if (bodyImageUrl) {
                    imagePath = bodyImageUrl;
                }

                // Validate category
                if (category && !CATEGORIES.includes(category)) {
                    return res.status(400).json({ error: "Invalid category provided." });
                }

                const newArticle = {
                    title,
                    image: imagePath, // This will now store the Cloudinary URL
                    date,
                    content,
                    createdAt: new Date(),
                    trending: trending === 'true',
                    likes: 0, // Initialize likes
                    views: 0, // NEW: Initialize views
                    category: category || 'កម្សាន្ត', // Use category from form, default to 'កម្សាន្ត'
                    comments: [] // Initialize comments array
                };

                const result = await newsCollection.insertOne(newArticle);
                res.status(201).json(result);
            }
            catch (err) {
                console.error("❌ Error inserting article:", err);
                res.status(500).json({ error: "Failed to create article" });
            }
        });

        // --- API Route for Inline Image Upload (Authentication Required) ---
        // MODIFIED: Added multer error handling middleware
        app.post("/api/upload-inline-image", isAuthenticated, (req, res, next) => {
            uploadInlineImage(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    return res.status(500).json({ message: `Inline image upload error: ${err.message}` });
                } else if (err) {
                    return res.status(500).json({ message: `An unknown error occurred during inline image upload: ${err.message}` });
                }
                next(); // Proceed to actual route handler
            });
        }, (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "No image file provided." });
                }
                const imageUrl = req.file.path;
                res.status(200).json({ url: imageUrl, message: "Image uploaded successfully! This URL is permanent." });
            }
            catch (error) {
                console.error("❌ Error processing inline image upload:", error);
                res.status(500).json({ message: "Failed to upload image." });
            }
        });

        // --- API Routes for Liking Articles ---
        app.post("/api/articles/:id/like", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                const result = await newsCollection.updateOne(
                    { _id: new ObjectId(articleId) },
                    { $inc: { likes: 1 } } // Increment the 'likes' field by 1
                );
                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Article not found" });
                }
                // Fetch the updated article to return the new like count
                const updatedArticle = await newsCollection.findOne({ _id: new ObjectId(articleId) }, { projection: { likes: 1 } });
                res.status(200).json({ message: "Article liked!", likes: updatedArticle.likes || 0 });
            }
            catch (err) {
                console.error("❌ Error liking article:", err);
                res.status(500).json({ error: "Failed to like article" });
            }
        });

        // --- API Routes for Comments ---
        app.get("/api/articles/:id/comments", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                // Fetch comments directly from the article document
                const article = await newsCollection.findOne({ _id: new ObjectId(articleId) }, { projection: { comments: 1 } });
                if (!article) {
                    return res.status(404).json({ message: 'Article not found.' });
                }
                // Ensure comments array exists, sort by createdAt for consistent display (oldest first)
                const comments = article.comments ? article.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : [];
                res.status(200).json(comments);
            }
            catch (err) {
                console.error("❌ Error fetching comments:", err);
                res.status(500).json({ error: "Failed to fetch comments" });
            }
        });

        app.post("/api/articles/:id/comments", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                const { author, text } = req.body; 
                // Basic validation
                if (!text || text.trim() === '') {
                    return res.status(400).json({ error: "Comment text cannot be empty." });
                }
                if (author && author.length > 50) { // Limit author name length
                    return res.status(400).json({ error: "Author name too long." });
                }

                const newComment = {
                    _id: new ObjectId(), // Unique ID for the comment
                    author: author && author.trim() !== '' ? author.trim() : "Anonymous", // Use Anonymous if author is empty
                    text: text.trim(), 
                    createdAt: new Date(),
                };
                const result = await newsCollection.updateOne( // Store comments directly in the article document
                    { _id: new ObjectId(articleId) },
                    { $push: { comments: newComment } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Article not found." });
                }
                res.status(201).json(newComment); // Return the inserted comment structure
            }
            catch (err) {
                console.error("❌ Error adding comment:", err);
                res.status(500).json({ error: "Failed to add comment" });
            }
        });


        // --- NEW: API Route to Update an Article (Authentication Required) ---
        // MODIFIED: Added multer error handling middleware and removed category/tags from update
        app.put("/api/articles/:id", isAuthenticated, (req, res, next) => {
            uploadThumbnail(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    return res.status(500).json({ error: `File upload error: ${err.message}` });
                } else if (err) {
                    return res.status(500).json({ error: `An unknown error occurred during upload: ${err.message}` });
                }
                next(); // Proceed to actual route handler
            });
        }, async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format." });
                }

                const { title, date, content, trending, imageUrl: bodyImageUrl, category } = req.body; 
                const updateDoc = {
                    title,
                    date,
                    content,
                    trending: trending === 'true',
                    category: category || 'កម្សាន្ត', // Use category from form, default to 'កម្សាន្ត'
                };

                // Handle image update: file upload takes precedence
                if (req.file) {
                    updateDoc.image = req.file.path; // Cloudinary URL
                } else if (bodyImageUrl) {
                    updateDoc.image = bodyImageUrl;
                }

                const result = await newsCollection.updateOne(
                    { _id: new ObjectId(articleId) },
                    { $set: updateDoc }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Article not found." });
                }
                res.status(200).json({ message: "Article updated successfully!" });
            }
            catch (err) {
                console.error("❌ Error updating article:", err);
                res.status(500).json({ error: "Failed to update article." });
            }
        });

        // --- NEW: API Route to Delete an Article (Authentication Required) ---
        app.delete("/api/articles/:id", isAuthenticated, async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format." });
                }

                const result = await newsCollection.deleteOne({ _id: new ObjectId(articleId) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: "Article not found." });
                }
                res.status(200).json({ message: "Article deleted successfully!." });
            }
            catch (err) {
                console.error("❌ Error deleting article:", err);
                res.status(500).json({ error: "Failed to delete article." });
            }
        });


        // Start the Express server
        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

// Call the function to start the server
startServer();