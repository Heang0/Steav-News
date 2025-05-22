const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const multer = require("multer");
const fs = require('fs').promises; // <<< UNCOMMENT/ADD THIS LINE BACK

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const port = process.env.PORT || 5000;

// --- CONFIGURE CLOUDINARY (ADD THIS SECTION) ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// --- END CLOUDINARY CONFIG ---


// // OPTIONAL: REVIEW THIS LINE
// // If ALL your images (thumbnails, inline, etc.) will now come from Cloudinary,
// // and you have no other static images in public/uploads you need to serve,
// // you can REMOVE or COMMENT OUT the following line:
// app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
// // If you still have manually placed images in public/uploads (e.g., 'default_og_image.jpg' if it's there),
// // or other static files in public/uploads, then keep this line.
// // Otherwise, it's not strictly needed for Cloudinary-hosted images.


// Middleware setup - Using express's built-in body parsers
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory


// MongoDB connection details
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "kpop_news";
const collectionName = "articles"; // This collection is used for both articles and trending

// --- Authentication Middleware ---
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin6232'; // Make sure this matches your desired admin password

const isAuthenticated = (req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    // In a real app, you'd fetch the session from a database/cache and validate it.
    if (sessionId === process.env.ADMIN_SESSION_ID) {
        next(); // User is authenticated
    } else {
        res.status(401).json({ message: "Unauthorized: Invalid session ID." });
    }
};

// --- REPLACE MULTER CONFIGURATION FOR THUMBNAIL WITH CLOUDINARY STORAGE ---
const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kpop_news_thumbnails", // OPTIONAL: A folder in Cloudinary to organize your thumbnails
        format: async (req, file) => 'jpg', // Set a default format, or use file.mimetype
        public_id: (req, file) => `thumbnail-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});
const uploadThumbnail = multer({ storage: thumbnailStorage });

// --- REPLACE MULTER CONFIGURATION FOR INLINE IMAGE UPLOADS WITH CLOUDINARY STORAGE ---
// In your server.js
const inlineImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kpop_news_inline_images",
        // REMOVE OR COMMENT OUT THIS LINE: format: async (req, file) => 'jpg',
        public_id: (req, file) => `inline-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});
const uploadInlineImage = multer({ storage: inlineImageStorage });


// Function to connect to MongoDB and start the server
async function startServer() {
    try {
        // Connect the client to the MongoDB server
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        // Get a reference to the database and collection
        const db = client.db(dbName);
        const newsCollection = db.collection(collectionName); // Assuming 'articles' is the correct collection name

        // Route to serve your main HTML page
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../public", "index.html"));
        });

        // --- NEW: Dynamic Route for Article Detail Pages (for Open Graph Meta Tags) ---
        // This MUST be placed BEFORE `app.use(express.static(...))` if `article.html` is in `public`
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
                    // Serve a 404 page if article not found (consider creating public/404.html)
                    return res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
                }

                // Read the article.html template
                let htmlContent = await fs.readFile(path.join(__dirname, "../public", "article.html"), 'utf8'); // Keep fs.readFile here if you need to read static HTML files

                // Construct full absolute URL for Open Graph image and URL
                const protocol = req.protocol || 'http'; // Get current protocol (http or https)
                const host = req.headers.host; // Get current host (e.g., k-pop-news.onrender.com)

                // --- IMPORTANT CHANGE: Use Cloudinary URL directly for absoluteImageUrl ---
                const absoluteImageUrl = article.image ? article.image : `${protocol}://${host}/images/default_og_image.jpg`;
                const absoluteArticleUrl = `${protocol}://${host}/article.html?id=${article._id}`;

                // Extract a plain text description from content (remove HTML tags and limit length)
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

        // Serve static files from the 'public' directory (this line stays in its original position)
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
                // Find articles where 'trending' is true, sort by createdAt (newest first), limit to top 5
                // Ensure your articles in MongoDB have a boolean 'trending' field.
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
        // Note: The collection used here is `newsCollection` which is set to `articles`.
        app.post("/api/news", isAuthenticated, uploadThumbnail.single('thumbnail'), async (req, res) => {
            try {
                const { title, date, content, trending, imageUrl: bodyImageUrl } = req.body; // Renamed imageUrl from body to avoid conflict
                let imagePath = "/images/default_og_image.jpg"; // Default fallback if no file or external URL provided

                // --- IMPORTANT CHANGE: Get Cloudinary URL from req.file.path ---
                if (req.file) {
                    imagePath = req.file.path; // Multer-Cloudinary puts the Cloudinary URL here
                } else if (bodyImageUrl) { // Fallback if an external URL was passed in the body (less common with direct uploads)
                    imagePath = bodyImageUrl;
                } else {
                    // If neither a file was uploaded nor an external URL provided, it will use the default_og_image.jpg
                    // You might want to make this `return res.status(400).json({ error: "Thumbnail image is required." });`
                    // if you strictly require an image for every article.
                }

                const newArticle = {
                    title,
                    image: imagePath, // This will now store the Cloudinary URL
                    date, // This might be a string from your form, consider parsing to Date if needed
                    content,
                    createdAt: new Date(), // Always set creation date for consistent sorting
                    trending: trending === 'true' // Ensure trending is a boolean
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
                // --- IMPORTANT CHANGE: Cloudinary URL is in req.file.path ---
                const imageUrl = req.file.path; // Multer-Cloudinary puts the Cloudinary URL here
                res.status(200).json({ url: imageUrl, message: "Image uploaded successfully! This URL is permanent." });
            } catch (error) {
                console.error("❌ Error uploading inline image:", error);
                res.status(500).json({ message: "Failed to upload image." });
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