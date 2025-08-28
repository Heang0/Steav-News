
// Helper to build short, clean article links
function buildArticleLink(article) {
  if (article && article.shortId) return `/a/${article.shortId}`;
  if (article && article._id) return `/article/${article._id}`;
  return '#';
}

document.addEventListener('DOMContentLoaded', function() {
    // Removed all scroll-related logic for the footer.
    // The footer will now be a standard element at the bottom of the page.
});

// Assuming you still need this for the hamburger menu
function toggleMenu() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("open");
}