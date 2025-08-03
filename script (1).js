// Enhanced script with better image handling and animations
const state = {
    currentPage: 'home',
    isMenuOpen: false
};

let activeEventListeners = [];

function setupCursorAnimation(containerId, cursorId) {
    const container = document.getElementById(containerId);
    const cursor = document.getElementById(cursorId);
    if (!container || !cursor) return;
    
    const mouseMoveHandler = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        cursor.style.opacity = '1';
    };
    
    const mouseLeaveHandler = () => { cursor.style.opacity = '0'; };
    
    container.addEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('mouseleave', mouseLeaveHandler);
    
    activeEventListeners.push({ element: container, type: 'mousemove', handler: mouseMoveHandler });
    activeEventListeners.push({ element: container, type: 'mouseleave', handler: mouseLeaveHandler });
}

function cleanupEventListeners() {
    activeEventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
    });
    activeEventListeners = [];
}

function navigateTo(page) {
    if (state.currentPage === page && document.getElementById(`${page}-page`)?.classList.contains('is-active')) {
        closeMobileMenu();
        return;
    }
    
    const transitionOverlay = document.getElementById('page-transition-overlay');
    const currentActivePage = document.querySelector('.page-content.is-active');
    
    transitionOverlay.classList.add('is-transitioning');
    
    setTimeout(() => {
        if (currentActivePage) {
            currentActivePage.classList.remove('is-active');
        }
        
        state.currentPage = page;
        const newPageElement = document.getElementById(`${state.currentPage}-page`);
        if (newPageElement) {
            newPageElement.classList.add('is-active');
        }
        
        closeMobileMenu();
        initPageAnimations(page);
        
        if (window.location.hash !== `#${page}`) {
            history.pushState({page: page}, '', `#${page}`);
        }
        
        window.scrollTo(0, 0);
        
        setTimeout(() => {
            transitionOverlay.classList.remove('is-transitioning');
        }, 50);
    }, 800);
}

function closeMobileMenu() {
    state.isMenuOpen = false;
    document.getElementById('mobile-menu').classList.remove('is-open');
    document.getElementById('hamburger-button').classList.remove('is-active');
}

function handleLoader() {
    const loaderContainer = document.getElementById('loader-container');
    const loaderMessage = document.getElementById('loader-message');
    const messages = ['Bonjour!', 'Preparing French delicacies...', 'Almost ready...', 'Bon appétit!'];
    let messageIndex = 0;
    
    const messageInterval = setInterval(() => {
        loaderMessage.textContent = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;
    }, 800);
    
    setTimeout(() => {
        clearInterval(messageInterval);
        loaderContainer.style.opacity = '0';
        setTimeout(() => {
            loaderContainer.style.display = 'none';
            
            const initialPage = window.location.hash ? window.location.hash.slice(1) : 'home';
            state.currentPage = initialPage;
            
            const newPageElement = document.getElementById(`${state.currentPage}-page`);
            if (newPageElement) {
                newPageElement.classList.add('is-active');
            }
            
            initPageAnimations(initialPage);
            history.replaceState({page: initialPage}, '', `#${initialPage}`);
        }, 500);
    }, 3500);
}

const scrollListener = () => {
    const scrollText = document.getElementById('scroll-text');
    if(!scrollText) return;
    const scrollY = window.scrollY;
    const newScale = 1 - scrollY * 0.0008;
    if (newScale > 0.6) {
        scrollText.style.transform = `scale(${newScale})`;
    }
};

let threeJsCleanup = null;

function initPairingPage() {
    const canvas = document.getElementById('three-canvas');
    if (canvas && !threeJsCleanup) {
        let scene, camera, renderer, objects, animationFrameId;
        let mouseX = 0, mouseY = 0;
        
        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            const light = new THREE.DirectionalLight(0xffffff, 1.5);
            light.position.set(5, 5, 5).normalize();
            scene.add(light);
            
            const ambientLight = new THREE.AmbientLight(0x404040, 2);
            scene.add(ambientLight);
            
            objects = [];
            
            // Create wine glasses and cheese wheels
            const glassGeometry = new THREE.ConeGeometry(0.5, 2, 8);
            const glassMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xE0A458, 
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });
            
            const cheeseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16);
            const cheeseMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xF4D03F, 
                shininess: 30 
            });
            
            for (let i = 0; i < 15; i++) {
                const isGlass = i % 2 === 0;
                const geometry = isGlass ? glassGeometry : cheeseGeometry;
                const material = isGlass ? glassMaterial : cheeseMaterial;
                
                const object = new THREE.Mesh(geometry, material);
                object.position.set(
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 30
                );
                object.rotation.set(
                    Math.random() * 2 * Math.PI,
                    Math.random() * 2 * Math.PI,
                    Math.random() * 2 * Math.PI
                );
                objects.push(object);
                scene.add(object);
            }
            
            camera.position.z = 20;
        };
        
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            
            objects.forEach((obj, index) => {
                obj.rotation.x += 0.003 + index * 0.001;
                obj.rotation.y += 0.004 + index * 0.001;
                obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
            });
            
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
            camera.position.y += (-mouseY * 3 - camera.position.y) * 0.03;
            camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        };
        
        const handleResize = () => {
            const container = canvas.parentElement;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        
        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        };
        
        init();
        animate();
        handleResize();
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        
        threeJsCleanup = () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (renderer) renderer.dispose();
            threeJsCleanup = null;
        };
    }
}

// Enhanced Gallery Cursor Animation System
function initGalleryCursorAnimations() {
    const galleryContainer = document.getElementById('gallery-grid-container');
    const customCursor = document.getElementById('gallery-custom-cursor');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (!galleryContainer || !customCursor) return;
    
    let isInGallery = false;
    let currentHoveredItem = null;
    
    // Mouse move handler for gallery container
    const handleMouseMove = (e) => {
        const rect = galleryContainer.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        customCursor.style.left = `${x}px`;
        customCursor.style.top = `${y}px`;
        
        if (!isInGallery) {
            isInGallery = true;
            customCursor.style.opacity = '1';
            customCursor.classList.add('active');
        }
    };
    
    // Mouse leave handler for gallery container
    const handleMouseLeave = () => {
        isInGallery = false;
        customCursor.style.opacity = '0';
        customCursor.classList.remove('active', 'hover-active');
        if (currentHoveredItem) {
            currentHoveredItem.classList.remove('cursor-hover');
            currentHoveredItem = null;
        }
    };
    
    // Add event listeners to gallery container
    galleryContainer.addEventListener('mousemove', handleMouseMove);
    galleryContainer.addEventListener('mouseleave', handleMouseLeave);
    
    // Add hover effects to individual gallery items
    galleryItems.forEach((item, index) => {
        item.addEventListener('mouseenter', (e) => {
            customCursor.classList.add('hover-active');
            item.classList.add('cursor-hover');
            currentHoveredItem = item;
            
            // Create ripple effect
            createRippleEffect(e, item);
        });
        
        item.addEventListener('mouseleave', () => {
            customCursor.classList.remove('hover-active');
            item.classList.remove('cursor-hover');
            if (currentHoveredItem === item) {
                currentHoveredItem = null;
            }
        });
        
        // Add click effect
        item.addEventListener('click', (e) => {
            createClickEffect(e, item);
        });
    });
    
    // Store event listeners for cleanup
    activeEventListeners.push(
        { element: galleryContainer, type: 'mousemove', handler: handleMouseMove },
        { element: galleryContainer, type: 'mouseleave', handler: handleMouseLeave }
    );
}

// Create ripple effect on hover
function createRippleEffect(e, item) {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.classList.add('gallery-ripple');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    
    item.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 800);
}

// Create click effect
function createClickEffect(e, item) {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickEffect = document.createElement('div');
    clickEffect.style.position = 'absolute';
    clickEffect.style.left = `${x}px`;
    clickEffect.style.top = `${y}px`;
    clickEffect.style.width = '40px';
    clickEffect.style.height = '40px';
    clickEffect.style.background = 'radial-gradient(circle, rgba(224,164,88,0.6) 0%, transparent 70%)';
    clickEffect.style.borderRadius = '50%';
    clickEffect.style.transform = 'translate(-50%, -50%) scale(0)';
    clickEffect.style.pointerEvents = 'none';
    clickEffect.style.animation = 'gallery-ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    item.appendChild(clickEffect);
    
    setTimeout(() => {
        clickEffect.remove();
    }, 600);
}

function initPageAnimations(page) {
    cleanupEventListeners();
    
    if (page !== 'pairing' && threeJsCleanup) {
        threeJsCleanup();
    }
    
    switch (page) {
        case 'home':
            window.addEventListener('scroll', scrollListener);
            activeEventListeners.push({ element: window, type: 'scroll', handler: scrollListener });
            
            // Initialize infinite marquee
            initInfiniteMarquee();
            
            // Animate hero images rotation
            const heroImages = [
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=2070&auto=format&fit=crop'
            ];
            let currentImageIndex = 0;
            const heroImage = document.getElementById('hero-image');
            
            if (heroImage) {
                setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % heroImages.length;
                    heroImage.style.opacity = '0.7';
                    setTimeout(() => {
                        heroImage.src = heroImages[currentImageIndex];
                        heroImage.style.opacity = '1';
                    }, 500);
                }, 5000);
            }
            break;
            
        case 'cuisine':
            // No custom cursor for cuisine page - using standard pointer cursor
            break;
            
        case 'gallery':
            initGalleryCursorAnimations();
            break;
            
        case 'pairing':
            initPairingPage();
            break;
    }
}

// Enhanced Infinite Marquee Implementation
function initInfiniteMarquee() {
    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;
    
    // Clone the marquee items to create seamless loop
    const marqueeItems = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML = marqueeItems + marqueeItems;
    
    // Add intersection observer for performance
    const marqueeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                marqueeTrack.style.animationPlayState = 'running';
            } else {
                marqueeTrack.style.animationPlayState = 'paused';
            }
        });
    }, { threshold: 0.1 });
    
    marqueeObserver.observe(marqueeTrack.parentElement);
    
    // Add smooth hover effects
    const marqueeItemsElements = document.querySelectorAll('.marquee-item');
    marqueeItemsElements.forEach(item => {
        item.addEventListener('mouseenter', () => {
            marqueeTrack.style.animationPlayState = 'paused';
        });
        
        item.addEventListener('mouseleave', () => {
            marqueeTrack.style.animationPlayState = 'running';
        });
    });
}

// Enhanced image loading with fade-in effect
function enhanceImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0';
            img.addEventListener('load', () => {
                img.style.transition = 'opacity 0.5s ease-in-out';
                img.style.opacity = '1';
            });
        }
    });
}

// Main Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    handleLoader();
    enhanceImageLoading();
    
    const hamburger = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            state.isMenuOpen = !state.isMenuOpen;
            hamburger.classList.toggle('is-active', state.isMenuOpen);
            mobileMenu.classList.toggle('is-open', state.isMenuOpen);
        });
    }
    
    document.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.closest('a').getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

window.addEventListener('popstate', (e) => {
    const newPage = e.state ? e.state.page : 'home';
    navigateTo(newPage);
});

// Smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
setTimeout(() => {
    const animateElements = document.querySelectorAll('.pairing-card, .gallery-item, .image-grid-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}, 1000);