const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const multer = require("multer");
const fs = require('fs').promises; // Import fs.promises for async file operations

const app = express();
const port = process.env.PORT || 5000;

// Serve uploaded images statically from the public/uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Middleware setup - Using express's built-in body parsers
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies


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

// --- Multer Configuration for Thumbnail Image Upload ---
const thumbnailStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../public/uploads");
        require('fs').mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const uploadThumbnail = multer({ storage: thumbnailStorage });

// --- Multer Configuration for INLINE Image Uploads ---
const inlineImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../public/uploads");
        require('fs').mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, 'inline-' + Date.now() + '-' + encodeURIComponent(file.originalname));
    }
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
                let htmlContent = await fs.readFile(path.join(__dirname, "../public", "article.html"), 'utf8');

                // Construct full absolute URL for Open Graph image and URL
                const protocol = req.protocol || 'http'; // Get current protocol (http or https)
                const host = req.headers.host; // Get current host (e.g., k-pop-news.onrender.com)

                // Ensure absolute path for images (e.g., https://yourdomain.com/uploads/image.jpg)
                const absoluteImageUrl = article.image ? `${protocol}://${host}${article.image}` : `${protocol}://${host}/images/default_og_image.jpg`; // Ensure default_og_image.jpg exists in public/images
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
                const { title, date, content, trending, imageUrl } = req.body;
                let imagePath = '';

                if (req.file) {
                    imagePath = `/uploads/${req.file.filename}`;
                } else if (imageUrl) {
                    imagePath = imageUrl;
                } else {
                    return res.status(400).json({ error: "Thumbnail image (file or URL) is required." });
                }

                const newArticle = {
                    title,
                    image: imagePath,
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
                const imageUrl = `/uploads/${req.file.filename}`;
                res.status(200).json({ url: imageUrl, message: "Image uploaded successfully!" });
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