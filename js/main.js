document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const overlay = document.getElementById('overlay');

    // Show mobile toggle if on mobile
    const checkMobile = () => {
        if (window.innerWidth <= 768) {
            mobileToggle.style.display = 'block';
        } else {
            mobileToggle.style.display = 'none';
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
        }
    };

    window.addEventListener('resize', checkMobile);
    checkMobile();

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.style.display = 'block';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
        });
    }

    // Active link logic
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle Search Bar Focus
    const searchIcon = document.querySelector('.top-right .fa-search');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            console.log('Search clicked - implement search overlay if needed');
        });
    }
});
