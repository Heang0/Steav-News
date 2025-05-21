document.addEventListener('DOMContentLoaded', function() {
    // Removed all scroll-related logic for the footer.
    // The footer will now be a standard element at the bottom of the page.
});

// Assuming you still need this for the hamburger menu
function toggleMenu() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("open");
}