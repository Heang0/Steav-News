
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const multer = require("multer");
const fs = require("fs").promises;
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = process.env.DB_NAME || "kpop_news";
const collectionName = "articles";
const cardsCollectionName = "staff_cards";

const CATEGORIES = ["កម្សាន្ត", "សង្គម", "កីឡា", "ពិភពលោក"];

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ---------- Helpers ----------
function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function stripHtml(html = "") {
    return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildAbsoluteUrl(req, value) {
    const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
    const host = req.get("host");
    if (!value) return `${protocol}://${host}/images/default_og_image.jpg`;
    if (/^https?:\/\//i.test(value)) return value;
    return `${protocol}://${host}${value.startsWith("/") ? value : "/" + value}`;
}

function facebookLikeImage(url) {
    if (!url) return url;
    if (url.includes("cloudinary.com")) {
        return url.replace("/upload/", "/upload/w_1200,h_630,c_fill,q_auto,f_auto/");
    }
    return url;
}

async function renderArticlePage(req, res, newsCollection, routeType = "clean") {
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

        let htmlContent = await fs.readFile(path.join(__dirname, "../public", "article.html"), "utf8");

        const articleUrl =
            routeType === "html"
                ? `${req.get("x-forwarded-proto") || req.protocol || "https"}://${req.get("host")}/article.html?id=${article._id}`
                : `${req.get("x-forwarded-proto") || req.protocol || "https"}://${req.get("host")}/article?id=${article._id}`;

        const imageUrl = facebookLikeImage(buildAbsoluteUrl(req, article.image));
        const title = escapeHtml(article.title || "STEAV NEWS");
        const description = escapeHtml(
            stripHtml(article.content || "Read the latest STEAV NEWS here.").slice(0, 180)
        );

        const metaTags = `
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="STEAV NEWS">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:url" content="${articleUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
<link rel="canonical" href="${articleUrl}">
`;

        if (/<\/head>/i.test(htmlContent)) {
            htmlContent = htmlContent.replace(/<\/head>/i, `${metaTags}\n</head>`);
        } else {
            htmlContent = `${metaTags}\n${htmlContent}`;
        }

        res.setHeader("X-Debug-Article-Route", "hit");
        console.log("✅ SENDING DYNAMIC HTML FOR:", articleId);
        console.log('✅ HTML HAS OG TITLE:', htmlContent.includes('property="og:title"'));
        console.log("✅ HTML HAS ARTICLE TITLE:", htmlContent.includes(article.title || ""));
        res.status(200).send(htmlContent);
    } catch (err) {
        console.error("❌ Error serving dynamic article page:", err);
        res.status(500).send("Failed to load article page.");
    }
}

// ---------- Debug / bot logging ----------
app.use((req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const isFacebookBot =
        userAgent.includes("facebookexternalhit") || userAgent.includes("Facebot");

    console.log("=== REQUEST DEBUG ===");
    console.log("Time:", new Date().toISOString());
    console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("User-Agent:", userAgent.substring(0, 150));
    console.log("Is Facebook Bot:", isFacebookBot);
    console.log("=====================");

    res.on("finish", () => {
        if (isFacebookBot) {
            console.log("🎯 FACEBOOK RESPONSE:", {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
            });
        }
    });

    next();
});

// Minimal bot-friendly headers
app.use((req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const isFacebookBot =
        userAgent.includes("facebookexternalhit") || userAgent.includes("Facebot");

    if (isFacebookBot) {
        res.setHeader("X-Robots-Tag", "all");
    }

    next();
});

// General middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Cloudinary ----------
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const commonCloudinaryParams = {
    folder: "steav_news",
    upload_preset: "steav_news",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    quality: "auto:good",
    fetch_format: "auto",
};

const thumbnailStorage = new CloudinaryStorage({
    cloudinary,
    params: commonCloudinaryParams,
});

const inlineImageStorage = new CloudinaryStorage({
    cloudinary,
    params: commonCloudinaryParams,
});

const cardImageStorage = new CloudinaryStorage({
    cloudinary,
    params: commonCloudinaryParams,
});

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: { fileSize: 1024 * 1024 * 5 },
}).single("thumbnail");

const uploadInlineImage = multer({
    storage: inlineImageStorage,
    limits: { fileSize: 1024 * 1024 * 5 },
}).single("inlineImage");

const uploadCardImage = multer({
    storage: cardImageStorage,
    limits: { fileSize: 1024 * 1024 * 5 },
}).single("image");

// ---------- Auth ----------
const isAuthenticated = (req, res, next) => {
    const sessionId = req.headers["x-session-id"];
    if (sessionId === process.env.ADMIN_SESSION_ID) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized: Invalid session ID." });
};

async function startServer() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db(dbName);
        const newsCollection = db.collection(collectionName);
        const cardsCollection = db.collection(cardsCollectionName);

        // robots.txt
        app.get("/robots.txt", (req, res) => {
            const robotsContent = `User-agent: *
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Twitterbot
Allow: /

Sitemap: https://steav-news.onrender.com/sitemap.xml`;
            res.type("text/plain").send(robotsContent);
        });

        // Main pages
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../public", "index.html"));
        });

        app.get("/article.html", async (req, res) => {
            console.log("✅ HIT /article.html", req.query.id);
            await renderArticlePage(req, res, newsCollection, "html");
        });

        app.get("/article", async (req, res) => {
            console.log("✅ HIT /article", req.query.id);
            await renderArticlePage(req, res, newsCollection, "clean");
        });

        // Static files AFTER dynamic article routes
        app.use(express.static(path.join(__dirname, "../public")));

        // ---------- Auth endpoint ----------
        app.post("/api/login", (req, res) => {
            const { username, password } = req.body;
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                return res.status(200).json({
                    message: "Login successful",
                    sessionId: process.env.ADMIN_SESSION_ID,
                });
            }
            res.status(401).json({ message: "Invalid credentials" });
        });

        // ---------- Articles ----------
        app.get("/api/articles", async (req, res) => {
            try {
                const { search, category, tag, limit, offset } = req.query;
                const query = {};
                const processedSearch = typeof search === "string" ? search.trim() : "";

                if (processedSearch) {
                    query.$or = [
                        { title: { $regex: processedSearch, $options: "i" } },
                        { content: { $regex: processedSearch, $options: "i" } },
                    ];
                }
                if (category) query.category = category;
                if (tag) query.tags = tag;

                let articlesQuery = newsCollection.find(query).sort({ createdAt: -1 });

                if (limit) articlesQuery = articlesQuery.limit(parseInt(limit, 10));
                if (offset) articlesQuery = articlesQuery.skip(parseInt(offset, 10));

                const articles = await articlesQuery.toArray();
                res.status(200).json(articles);
            } catch (err) {
                console.error("❌ Error fetching articles:", err);
                res.status(500).json({ error: "Failed to fetch articles" });
            }
        });

        app.get("/api/articles/count", async (req, res) => {
            try {
                const { search, category, tag } = req.query;
                const query = {};
                const processedSearch = typeof search === "string" ? search.trim() : "";

                if (processedSearch) {
                    query.$or = [
                        { title: { $regex: processedSearch, $options: "i" } },
                        { content: { $regex: processedSearch, $options: "i" } },
                    ];
                }
                if (category) query.category = category;
                if (tag) query.tags = tag;

                const count = await newsCollection.countDocuments(query);
                res.status(200).json({ count });
            } catch (err) {
                console.error("❌ Error fetching article count:", err);
                res.status(500).json({ error: "Failed to fetch article count" });
            }
        });

        app.get("/api/categories/homepage-previews", async (req, res) => {
            try {
                const categoryArticles = [];
                for (const category of CATEGORIES) {
                    const article = await newsCollection.findOne(
                        { category },
                        { sort: { createdAt: -1 } }
                    );
                    if (article) categoryArticles.push(article);
                }
                res.status(200).json(categoryArticles);
            } catch (err) {
                console.error("❌ Error fetching category homepage previews:", err);
                res.status(500).json({ error: "Failed to fetch category previews" });
            }
        });

        app.get("/api/trending", async (req, res) => {
            try {
                const trendingArticles = await newsCollection
                    .find({ trending: true })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .toArray();

                res.status(200).json(trendingArticles);
            } catch (err) {
                console.error("❌ Error fetching trending articles:", err);
                res.status(500).json({ error: "Failed to fetch trending articles" });
            }
        });

        app.get("/api/articles/:id", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }

                const result = await newsCollection.findOneAndUpdate(
                    { _id: new ObjectId(articleId) },
                    { $inc: { views: 1 } },
                    { returnDocument: "after" }
                );

                const article = result && (result.value || result);
                if (!article || !article._id) {
                    return res.status(404).json({ error: "Article not found" });
                }

                res.status(200).json(article);
            } catch (err) {
                console.error("❌ Error fetching single article:", err);
                res.status(500).json({ error: "Failed to fetch article" });
            }
        });

        app.post(
            "/api/news",
            isAuthenticated,
            (req, res, next) => {
                uploadThumbnail(req, res, function (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(500).json({ error: `File upload error: ${err.message}` });
                    } else if (err) {
                        return res.status(500).json({
                            error: `An unknown error occurred during upload: ${err.message}`,
                        });
                    }
                    next();
                });
            },
            async (req, res) => {
                try {
                    const { title, date, content, trending, imageUrl: bodyImageUrl, category } = req.body;
                    let imagePath = "/images/default_og_image.jpg";

                    if (req.file) {
                        imagePath = req.file.path;
                    } else if (bodyImageUrl) {
                        imagePath = bodyImageUrl;
                    }

                    if (category && !CATEGORIES.includes(category)) {
                        return res.status(400).json({ error: "Invalid category provided." });
                    }

                    const articleCount = await newsCollection.countDocuments();
                    const shortId = (articleCount + 1).toString().padStart(4, "0");

                    const newArticle = {
                        title,
                        image: imagePath,
                        date,
                        content,
                        createdAt: new Date(),
                        trending: trending === "true",
                        likes: 0,
                        views: 0,
                        category: category || "កម្សាន្ត",
                        comments: [],
                        shortId,
                    };

                    const result = await newsCollection.insertOne(newArticle);
                    res.status(201).json(result);
                } catch (err) {
                    console.error("❌ Error inserting article:", err);
                    res.status(500).json({ error: "Failed to create article" });
                }
            }
        );

        app.put(
            "/api/articles/:id",
            isAuthenticated,
            (req, res, next) => {
                uploadThumbnail(req, res, function (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(500).json({ error: `File upload error: ${err.message}` });
                    } else if (err) {
                        return res.status(500).json({
                            error: `An unknown error occurred during upload: ${err.message}`,
                        });
                    }
                    next();
                });
            },
            async (req, res) => {
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
                        trending: trending === "true",
                        category: category || "កម្សាន្ត",
                    };

                    if (req.file) {
                        updateDoc.image = req.file.path;
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
                } catch (err) {
                    console.error("❌ Error updating article:", err);
                    res.status(500).json({ error: "Failed to update article." });
                }
            }
        );

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

                res.status(200).json({ message: "Article deleted successfully!" });
            } catch (err) {
                console.error("❌ Error deleting article:", err);
                res.status(500).json({ error: "Failed to delete article." });
            }
        });

        // Inline image upload
        app.post(
            "/api/upload-inline-image",
            isAuthenticated,
            (req, res, next) => {
                uploadInlineImage(req, res, function (err) {
                    if (err instanceof multer.MulterError) {
                        return res
                            .status(500)
                            .json({ message: `Inline image upload error: ${err.message}` });
                    } else if (err) {
                        return res.status(500).json({
                            message: `An unknown error occurred during inline image upload: ${err.message}`,
                        });
                    }
                    next();
                });
            },
            (req, res) => {
                try {
                    if (!req.file) {
                        return res.status(400).json({ message: "No image file provided." });
                    }

                    res.status(200).json({
                        url: req.file.path,
                        message: "Image uploaded successfully! This URL is permanent.",
                    });
                } catch (error) {
                    console.error("❌ Error processing inline image upload:", error);
                    res.status(500).json({ message: "Failed to upload image." });
                }
            }
        );

        // Likes
        app.post("/api/articles/:id/like", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }

                const result = await newsCollection.updateOne(
                    { _id: new ObjectId(articleId) },
                    { $inc: { likes: 1 } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Article not found" });
                }

                const updatedArticle = await newsCollection.findOne(
                    { _id: new ObjectId(articleId) },
                    { projection: { likes: 1 } }
                );

                res.status(200).json({
                    message: "Article liked!",
                    likes: updatedArticle?.likes || 0,
                });
            } catch (err) {
                console.error("❌ Error liking article:", err);
                res.status(500).json({ error: "Failed to like article" });
            }
        });

        // Comments
        app.get("/api/articles/:id/comments", async (req, res) => {
            try {
                const articleId = req.params.id;
                if (!ObjectId.isValid(articleId)) {
                    return res.status(400).json({ error: "Invalid article ID format" });
                }

                const article = await newsCollection.findOne(
                    { _id: new ObjectId(articleId) },
                    { projection: { comments: 1 } }
                );

                if (!article) {
                    return res.status(404).json({ message: "Article not found." });
                }

                const comments = article.comments
                    ? article.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    : [];

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

                const { author, text } = req.body;
                if (!text || text.trim() === "") {
                    return res.status(400).json({ error: "Comment text cannot be empty." });
                }
                if (author && author.length > 50) {
                    return res.status(400).json({ error: "Author name too long." });
                }

                const newComment = {
                    _id: new ObjectId(),
                    author: author && author.trim() !== "" ? author.trim() : "Anonymous",
                    text: text.trim(),
                    createdAt: new Date(),
                };

                const result = await newsCollection.updateOne(
                    { _id: new ObjectId(articleId) },
                    { $push: { comments: newComment } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Article not found." });
                }

                res.status(201).json(newComment);
            } catch (err) {
                console.error("❌ Error adding comment:", err);
                res.status(500).json({ error: "Failed to add comment" });
            }
        });

        // ---------- Cards ----------
        app.post(
            "/api/cards",
            (req, res, next) => {
                uploadCardImage(req, res, function (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(500).json({ error: `File upload error: ${err.message}` });
                    } else if (err) {
                        return res.status(500).json({
                            error: `An unknown error occurred during upload: ${err.message}`,
                        });
                    }
                    next();
                });
            },
            async (req, res) => {
                try {
                    const { name, position, organization, id } = req.body;
                    let imagePath = "";

                    if (req.file) {
                        imagePath = req.file.path;
                    } else if (req.body.imageUrl) {
                        imagePath = req.body.imageUrl;
                    }

                    if (!name || !position || !organization) {
                        return res
                            .status(400)
                            .json({ error: "Name, position, and organization are required." });
                    }

                    let result;
                    let shortId;

                    if (id) {
                        if (!ObjectId.isValid(id)) {
                            return res.status(400).json({ error: "Invalid card ID format." });
                        }

                        const updateDoc = {
                            name,
                            position,
                            organization,
                            updatedAt: new Date(),
                        };

                        if (imagePath) updateDoc.image = imagePath;

                        result = await cardsCollection.updateOne(
                            { _id: new ObjectId(id) },
                            { $set: updateDoc }
                        );

                        if (result.matchedCount === 0) {
                            return res.status(404).json({ error: "Card not found." });
                        }

                        const existingCard = await cardsCollection.findOne({ _id: new ObjectId(id) });
                        shortId = existingCard.shortId;
                    } else {
                        const count = await cardsCollection.countDocuments();
                        shortId = (count + 1).toString().padStart(4, "0");

                        const newCard = {
                            name,
                            position,
                            organization,
                            image: imagePath,
                            shortId,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };

                        result = await cardsCollection.insertOne(newCard);
                    }

                    res.status(200).json({
                        message: "Card saved successfully!",
                        id: id || result.insertedId,
                        shortId,
                    });
                } catch (err) {
                    console.error("❌ Error saving card:", err);
                    res.status(500).json({ error: "Failed to save card" });
                }
            }
        );

        app.get("/api/cards/:id", async (req, res) => {
            try {
                const cardId = req.params.id;

                if (!ObjectId.isValid(cardId)) {
                    return res.status(400).json({ error: "Invalid card ID format" });
                }

                const card = await cardsCollection.findOne({ _id: new ObjectId(cardId) });
                if (!card) {
                    return res.status(404).json({ error: "Card not found" });
                }

                res.status(200).json(card);
            } catch (err) {
                console.error("❌ Error fetching card:", err);
                res.status(500).json({ error: "Failed to fetch card" });
            }
        });

        app.get("/api/cards/short/:shortId", async (req, res) => {
            try {
                const shortId = req.params.shortId;
                const card = await cardsCollection.findOne({ shortId });

                if (!card) {
                    return res.status(404).json({ error: "Card not found" });
                }

                res.status(200).json(card);
            } catch (err) {
                console.error("❌ Error fetching card by short ID:", err);
                res.status(500).json({ error: "Failed to fetch card" });
            }
        });

        // Clean URLs like /about -> about.html, /contact-us -> contact-us.html
        app.get("/:page", (req, res, next) => {
            if (req.params.page.startsWith("api")) return next();
            if (req.params.page.includes(".")) return next();
            if (req.params.page === "article") return next();

            const filePath = path.join(__dirname, "../public", `${req.params.page}.html`);
            res.sendFile(filePath, (err) => {
                if (err) next();
            });
        });

        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

cloudinary.api
    .ping()
    .then((result) => console.log("✅ Cloudinary connection successful:", result))
    .catch((err) => console.error("❌ Cloudinary connection failed:", err));

startServer();
