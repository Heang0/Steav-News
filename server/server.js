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
// !!! IMPORTANT: The `express.static` middleware that serves the 'public' directory
//    is now moved to inside the `startServer` function, AFTER the dynamic '/article.html' route.
//    DO NOT uncomment or re-add it here.


// MongoDB connection details
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "kpop_news";
const collectionName = "articles"; // This collection is used for both articles and trending
const commentsCollectionName = "comments"; // New collection for comments

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
const uploadThumbnail = multer({ storage: thumbnailStorage });

// --- MULTER CONFIGURATION FOR INLINE IMAGE UPLOADS WITH CLOUDINARY STORAGE ---
const inlineImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kpop_news_inline_images",
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `inline-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});
const uploadInlineImage = multer({ storage: inlineImageStorage });


// Function to connect to MongoDB and start the server
async function startServer() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db(dbName);
        const newsCollection = db.collection(collectionName);
        const commentsCollection = db.collection(commentsCollectionName); // Get comments collection

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
        app.get("/api/articles", async (req, res) => {
            try {
                const articles = await newsCollection.find({}).sort({ createdAt: -1 }).toArray();
                res.status(200).json(articles);
            } catch (err) {
                console.error("❌ Error fetching articles:", err);
                res.status(500).json({ error: "Failed to fetch articles" });
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
            } catch (err) {
                console.error("❌ Error fetching trending articles:", err);
                res.status(500).json({ error: "Failed to fetch trending articles" });
            }
        });

        // --- API Route to Get a Single Article by ID ---
        app.get("/api/articles/:id", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                const article = await newsCollection.findOne({ _id: new ObjectId(articleId) });
                if (!article) {
                    return res.status(404).json({ error: "Article not found" });
                }
                res.status(200).json(article);
            } catch (err) {
                console.error("❌ Error fetching single article:", err);
                res.status(500).json({ error: "Failed to fetch article" });
            }
        });

        // --- API Route to Add New Article (Authentication Required) ---
        app.post("/api/news", isAuthenticated, uploadThumbnail.single('thumbnail'), async (req, res) => {
            try {
                const { title, date, content, trending, imageUrl: bodyImageUrl } = req.body;
                let imagePath = "/images/default_og_image.jpg"; // Default fallback if no file or external URL provided

                if (req.file) {
                    imagePath = req.file.path; // Multer-Cloudinary puts the Cloudinary URL here
                } else if (bodyImageUrl) {
                    imagePath = bodyImageUrl;
                }

                const newArticle = {
                    title,
                    image: imagePath, // This will now store the Cloudinary URL
                    date,
                    content,
                    createdAt: new Date(),
                    trending: trending === 'true',
                    likes: 0 // Initialize likes for new articles
                };

                const result = await newsCollection.insertOne(newArticle);
                res.status(201).json(result);
            } catch (err) {
                console.error("❌ Error inserting article:", err);
                res.status(500).json({ error: "Failed to create article" });
            }
        });

        // --- API Route for Inline Image Upload (Authentication Required) ---
        app.post("/api/upload-inline-image", isAuthenticated, uploadInlineImage.single('inlineImage'), (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "No image file provided." });
                }
                const imageUrl = req.file.path;
                res.status(200).json({ url: imageUrl, message: "Image uploaded successfully! This URL is permanent." });
            } catch (error) {
                console.error("❌ Error uploading inline image:", error);
                res.status(500).json({ message: "Failed to upload image." });
            }
        });

        // --- NEW API Routes for Liking Articles ---
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
                res.status(200).json({ message: "Article liked!", likesUpdated: result.modifiedCount > 0 });
            } catch (err) {
                console.error("❌ Error liking article:", err);
                res.status(500).json({ error: "Failed to like article" });
            }
        });

        // --- NEW API Routes for Comments ---
        app.get("/api/articles/:id/comments", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }
                const commentsCollection = client.db(dbName).collection(commentsCollectionName);
                const comments = await commentsCollection.find({ articleId: new ObjectId(articleId) })
                                                         .sort({ createdAt: 1 }) // Show oldest first
                                                         .toArray();
                res.status(200).json(comments);
            } catch (err) {
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
                const { author, commentText } = req.body;
                // Basic validation
                if (!commentText || commentText.trim() === '') {
                    return res.status(400).json({ error: "Comment text cannot be empty." });
                }
                if (author && author.length > 50) { // Limit author name length
                    return res.status(400).json({ error: "Author name too long." });
                }

                const commentsCollection = client.db(dbName).collection(commentsCollectionName);
                const newComment = {
                    articleId: new ObjectId(articleId),
                    author: author && author.trim() !== '' ? author.trim() : "Anonymous", // Use Anonymous if author is empty
                    commentText: commentText.trim(),
                    createdAt: new Date(),
                };
                const result = await commentsCollection.insertOne(newComment);
                res.status(201).json(newComment); // Return the inserted comment structure
            } catch (err) {
                console.error("❌ Error adding comment:", err);
                res.status(500).json({ error: "Failed to add comment" });
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