const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5000;

// Serve uploaded images statically from the public/uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Middleware setup - Using express's built-in body parsers
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory


// MongoDB connection details
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "kpop_news";
const collectionName = "articles";

// --- Authentication Middleware ---
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin6232'; // Make sure this matches your desired admin password

const isAuthenticated = (req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    // In a real app, you'd fetch the session from a database/cache and validate it.
    if (sessionId === process.env.ADMIN_SESSION_ID) {
        next(); // User is authenticated
    } else {
        res.status(401).json({ message: 'Unauthorized: Invalid session ID.' });
    }
};

// --- Multer Configuration for Thumbnail Image Upload ---
const thumbnailStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // This path points to 'your_project_root/public/uploads'
        // Ensure this directory exists and Node.js has write permissions
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: function (req, file, cb) {
        // Use the original name with a timestamp to avoid conflicts
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const uploadThumbnail = multer({ storage: thumbnailStorage });

// --- NEW: Multer Configuration for INLINE Image Uploads ---
const inlineImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/uploads")); // Same upload directory
    },
    filename: function (req, file, cb) {
        // IMPORTANT: Encode the filename to handle spaces and special characters in URLs
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
        const newsCollection = db.collection(collectionName);

        // --- Authentication Endpoint ---
        app.post('/api/login', (req, res) => {
            const { username, password } = req.body;
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // In a real app, generate a more secure, unique session ID
                const sessionId = process.env.ADMIN_SESSION_ID || 'static-admin-session-id'; // Set ADMIN_SESSION_ID in your .env file
                res.status(200).json({ message: 'Login successful', sessionId: sessionId });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });

        // --- API Route to Get All Articles (Newest First) ---
        app.get("/api/articles", async (req, res) => {
            try {
                // Sort by createdAt date in descending order (newest first)
                const articles = await newsCollection.find({}).sort({ createdAt: -1 }).toArray();
                res.status(200).json(articles);
            } catch (err) {
                console.error("❌ Error fetching articles:", err);
                res.status(500).json({ error: "Failed to fetch articles" });
            }
        });

        // --- NEW: API Route to Get Trending Articles (Newest First) ---
        app.get("/api/trending", async (req, res) => {
            try {
                // Find articles where 'trending' is true, sort by createdAt (newest first), limit to top 5
                const trendingArticles = await newsCollection.find({ trending: true })
                                                            .sort({ createdAt: -1 })
                                                            .limit(5) // Limit to, for example, 5 trending articles
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
                // Validate if articleId is a valid ObjectId string
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
                // Destructure form data from req.body
                const { title, date, content, trending, imageUrl } = req.body;

                let imagePath = '';
                // Check if a file was uploaded or a URL was provided
                if (req.file) {
                    // If a file was uploaded, use its path
                    imagePath = `/uploads/${req.file.filename}`;
                } else if (imageUrl) {
                    // If an image URL was provided, use it directly
                    imagePath = imageUrl;
                } else {
                    // If neither, send an error (or set a default image)
                    return res.status(400).json({ error: "Thumbnail image (file or URL) is required." });
                }

                // Create the new article object
                const newArticle = {
                    title,
                    image: imagePath, // Use the path from upload or the provided URL
                    date, // Date as string from input
                    content,
                    createdAt: new Date(), // Add a timestamp for creation
                    trending: trending === 'true' // Convert string 'true'/'false' from FormData to boolean
                };

                // Insert the new article into the MongoDB collection
                const result = await newsCollection.insertOne(newArticle);
                // Send a 201 Created status and the result of the insertion
                res.status(201).json(result);
            } catch (err) {
                // Log any errors during article insertion to the console
                console.error("❌ Error inserting article:", err);
                // Send a 500 Internal Server Error response to the client
                res.status(500).json({ error: "Failed to create article" });
            }
        });

        // --- NEW: API Route for Inline Image Upload (Authentication Required) ---
        app.post("/api/upload-inline-image", isAuthenticated, uploadInlineImage.single('inlineImage'), (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "No image file provided." });
                }
                // Construct the public URL for the uploaded image using the encoded filename
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
        // Log any MongoDB connection errors to the console
        console.error("❌ MongoDB connection error:", err);
    }
}

// Call the function to start the server
startServer();