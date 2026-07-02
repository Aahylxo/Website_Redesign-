// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor Logic ---
    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('a, button, [data-hover], select, .interactive-card, .peek-trigger, .faq-card-header, .icon-box');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) cursor.style.opacity = '0';
    });
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
    });


    // --- Theme Toggle ---
    const themeBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Optional: check local storage for theme preference
    const savedTheme = localStorage.getItem('tca-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tca-theme', newTheme);
    });

    // --- Glass Nav Scroll Effect ---
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });


    // --- Intersection Observer for Fade-Up Reveal ---
    const fadeElements = document.querySelectorAll('.fade-up');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });


    // --- Interactive Peek Dashboard ---
    const triggers = document.querySelectorAll('.peek-trigger');
    const contents = document.querySelectorAll('.peek-content');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            // Remove active class from all
            triggers.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked trigger
            trigger.classList.add('active');

            // Show target content
            const targetId = trigger.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- Simple Calculator Logic ---
    const calcBtn = document.getElementById('calc-btn');
    const select = document.getElementById('revenue-select');
    const resultBox = document.getElementById('calc-result');

    calcBtn.addEventListener('click', () => {
        const val = select.value;
        if (!val) return;

        resultBox.classList.remove('hidden');
        resultBox.style.opacity = 0;
        
        // Simple mock logic for demonstration
        setTimeout(() => {
            if (val === 'large') {
                resultBox.innerHTML = '<div style="color: var(--brand-mint); font-weight:600;"><i data-lucide="alert-circle" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 1: Mandatory by 1 January 2027.</div>';
            } else if (val === 'sme') {
                resultBox.innerHTML = '<div style="color: var(--brand-deep-blue); font-weight:600;"><i data-lucide="info" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 2: Mandatory by 1 July 2027.</div>';
            } else {
                resultBox.innerHTML = '<div style="color: var(--brand-yellow); font-weight:600;"><i data-lucide="shield-alert" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 3: Mandatory by 1 October 2027 (B2G).</div>';
            }
            
            // Re-initialize icons inside result box
            lucide.createIcons();
            
            // Fade in effect
            resultBox.style.transition = 'opacity 0.5s ease';
            resultBox.style.opacity = 1;
        }, 100);
    });

    // --- FAQ Accordion Logic ---
    const faqHeaders = document.querySelectorAll('.faq-card-header');
    
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            // Toggle active class to expand/collapse via CSS max-height
            card.classList.toggle('active');
        });
    });

    // --- 2D Canvas Dots Background ---
    const initCanvasDots = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const canvas = document.getElementById('hero-canvas');
        const container = document.getElementById('canvas-container');
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let dpr = window.devicePixelRatio || 1;

        const resize = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            initDots();
        };

        let mouseX = -1000;
        let mouseY = -1000;
        document.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        // Grid parameters
        const spacing = 35;
        let dots = [];

        const initDots = () => {
            dots = [];
            for (let x = 0; x < width; x += spacing) {
                for (let y = 0; y < height; y += spacing) {
                    dots.push({
                        baseX: x + spacing / 2,
                        baseY: y + spacing / 2,
                        x: x + spacing / 2,
                        y: y + spacing / 2,
                    });
                }
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const interactionRadius = 120;

            dots.forEach(dot => {
                // Mouse repulsion
                const dx = mouseX - dot.baseX;
                const dy = mouseY - dot.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = dot.baseX;
                let targetY = dot.baseY;
                let size = 1.5;

                if (dist < interactionRadius) {
                    const force = (interactionRadius - dist) / interactionRadius;
                    targetX -= (dx / dist) * force * 15;
                    targetY -= (dy / dist) * force * 15;
                    size += force * 1.5;
                    
                    if (isDark) {
                        ctx.fillStyle = `rgba(0, 208, 250, ${0.15 + force * 0.6})`;
                    } else {
                        ctx.fillStyle = `rgba(0, 74, 252, ${0.15 + force * 0.6})`;
                    }
                } else {
                    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                }

                // Easing
                dot.x += (targetX - dot.x) * 0.1;
                dot.y += (targetY - dot.y) * 0.1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        animate();
    };

    initCanvasDots();
});
