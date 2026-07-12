// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Custom Cursor Logic ---
    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('a, button, [data-hover], select, .interactive-card, .peek-trigger, .faq-card-header, .icon-box');

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });

        document.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget) cursor.style.opacity = '0';
        });
        document.addEventListener('mouseover', () => {
            cursor.style.opacity = '1';
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // --- Theme Toggle ---
    const themeBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

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
    }, { passive: true });

    // --- Sliding Nav Indicator ---
    const navList = document.getElementById('nav-list');
    const navIndicator = document.getElementById('nav-indicator');
    const navLinks = navList ? navList.querySelectorAll('a') : [];

    function moveIndicatorTo(link) {
        if (!navIndicator || !link) return;
        const listRect = navList.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        navIndicator.style.width = linkRect.width + 'px';
        navIndicator.style.transform = `translateX(${linkRect.left - listRect.left}px)`;
    }

    if (navLinks.length) {
        const activeLink = navList.querySelector('a.active-link') || navLinks[0];
        requestAnimationFrame(() => moveIndicatorTo(activeLink));

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => moveIndicatorTo(link));
            link.addEventListener('click', () => {
                navLinks.forEach(l => l.classList.remove('active-link'));
                link.classList.add('active-link');
            });
        });
        navList.addEventListener('mouseleave', () => {
            const current = navList.querySelector('a.active-link') || navLinks[0];
            moveIndicatorTo(current);
        });
        window.addEventListener('resize', () => {
            const current = navList.querySelector('a.active-link') || navLinks[0];
            moveIndicatorTo(current);
        });
    }

    // --- Mobile Drawer ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    function closeDrawer() {
        menuBtn.classList.remove('open');
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    function openDrawer() {
        menuBtn.classList.add('open');
        drawer.classList.add('open');
        backdrop.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    if (menuBtn && drawer && backdrop) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.contains('open') ? closeDrawer() : openDrawer();
        });
        backdrop.addEventListener('click', closeDrawer);
        drawer.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeDrawer));
        const drawerLinks = drawer.querySelectorAll('.mobile-drawer-nav a');
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                drawerLinks.forEach(l => l.classList.remove('active-link'));
                link.classList.add('active-link');
                if (navLinks.length) {
                    navLinks.forEach(l => l.classList.remove('active-link'));
                    const match = Array.from(navLinks).find(l => l.getAttribute('href') === link.getAttribute('href'));
                    if (match) { match.classList.add('active-link'); moveIndicatorTo(match); }
                }
            });
        });
        window.addEventListener('resize', () => { if (window.innerWidth > 860) closeDrawer(); });
    }

    // --- Intersection Observer for Fade-Up Reveal (mixed stagger) ---
    const fadeElements = document.querySelectorAll('.fade-up');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // --- Interactive Peek Dashboard ---
    const triggers = document.querySelectorAll('.peek-trigger');
    const contents = document.querySelectorAll('.peek-content');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            triggers.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            trigger.classList.add('active');
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

        setTimeout(() => {
            if (val === 'large') {
                resultBox.innerHTML = '<div style="color: var(--brand-mint); font-weight:600;"><i data-lucide="alert-circle" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 1: Mandatory by 1 January 2027.</div>';
            } else if (val === 'sme') {
                resultBox.innerHTML = '<div style="color: var(--brand-deep-blue); font-weight:600;"><i data-lucide="info" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 2: Mandatory by 1 July 2027.</div>';
            } else {
                resultBox.innerHTML = '<div style="color: var(--brand-yellow); font-weight:600;"><i data-lucide="shield-alert" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;"></i>Phase 3: Mandatory by 1 October 2027 (B2G).</div>';
            }

            lucide.createIcons();

            resultBox.style.transition = 'opacity 0.5s ease';
            resultBox.style.opacity = 1;
        }, 100);
    });

    // --- Partners Arc: compute dome positions + trigger fan-in reveal ---
    const arcLogos = document.querySelectorAll('.arc-logo');
    if (arcLogos.length) {
        const R = 300;       // arc radius (px)
        const FLATTEN = 0.62; // dome flatten factor
        arcLogos.forEach(el => {
            const angleDeg = parseFloat(el.style.getPropertyValue('--angle')) || 0;
            const rad = angleDeg * (Math.PI / 180);
            const tx = Math.sin(rad) * R;
            const ty = -Math.cos(rad) * R * FLATTEN;
            const rot = angleDeg * 0.4;
            el.style.setProperty('--tx', tx.toFixed(1) + 'px');
            el.style.setProperty('--ty', ty.toFixed(1) + 'px');
            el.style.setProperty('--rot', rot.toFixed(1) + 'deg');
        });

        const arcEl = document.getElementById('trust-arc');
        if (arcEl) {
            const arcObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        arcEl.classList.add('arc-revealed');
                        arcObserver.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            arcObserver.observe(arcEl);
        }
    }

    // --- Mandate Moment: Curved Peek Carousel with Seamless Infinite Loop ---
    const carouselStage = document.getElementById('carousel-stage');
    if (carouselStage) {
        const originals = Array.from(carouselStage.querySelectorAll('.carousel-card'));
        const realCount = originals.length;
        const BUFFER = 2;

        // Build seamless-loop buffer: clone last 2 cards to the front, first 2 to the back.
        const makeClone = (el) => {
            const clone = el.cloneNode(true);
            clone.classList.add('is-clone');
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('tabindex', '-1');
            return clone;
        };
        const beforeClones = originals.slice(realCount - BUFFER).map(makeClone);
        const afterClones = originals.slice(0, BUFFER).map(makeClone);
        beforeClones.reverse().forEach(clone => carouselStage.insertBefore(clone, carouselStage.firstChild));
        afterClones.forEach(clone => carouselStage.appendChild(clone));

        const cards = Array.from(carouselStage.querySelectorAll('.carousel-card'));
        const dots = Array.from(document.querySelectorAll('.carousel-dot'));
        const dotsRow = document.getElementById('carousel-dots');
        const dotBlob = document.getElementById('carousel-dot-blob');
        const dotsGlass = document.getElementById('carousel-dots-glass');
        let activeIndex = BUFFER; // starts on the first real card
        const realIndexOf = (i) => ((i - BUFFER) % realCount + realCount) % realCount;

        function spacing() {
            const w = window.innerWidth;
            if (w < 640) return { tx: 100, rot: 20, scaleStep: 0.16, curve: 9 };
            if (w < 1024) return { tx: 140, rot: 24, scaleStep: 0.17, curve: 11 };
            return { tx: 168, rot: 28, scaleStep: 0.18, curve: 13 };
        }

        function moveDotBlob() {
            if (!dotBlob || !dots.length) return;
            const target = dots[realIndexOf(activeIndex)];
            if (!target) return;
            const rowRect = dotsRow.getBoundingClientRect();
            const dotRect = target.getBoundingClientRect();
            dotBlob.style.width = dotRect.width + 'px';
            dotBlob.style.borderRadius = '5px';
            dotBlob.style.transform = `translate(${dotRect.left - rowRect.left}px, -50%)`;
        }

        function render() {
            const { tx, rot, scaleStep, curve } = spacing();
            cards.forEach((card, i) => {
                const offset = i - activeIndex;
                const abs = Math.abs(offset);
                // Curved arc: cards dip down the further they sit from the centre
                const translateX = offset * tx;
                const translateY = abs * abs * curve;
                const rotateY = Math.max(-rot * 2, Math.min(rot * 2, offset * -rot));
                const scale = Math.max(1 - abs * scaleStep, 0.5);
                const opacity = Math.max(1 - abs * 0.34, 0);
                const z = 20 - abs;

                card.style.transform = `translateX(${translateX}px) translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = z;
                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
                card.classList.toggle('active', offset === 0);
                if (offset !== 0) card.classList.remove('is-flipped');
            });
            dots.forEach((dot, i) => dot.classList.toggle('active', i === realIndexOf(activeIndex)));
            moveDotBlob();
        }

        // After sliding into a clone, silently snap back to the matching real card —
        // invisible to the eye since the clone is a pixel-perfect copy, but it's what
        // removes the hard "reset to the left" jump and makes the loop feel continuous.
        function settleIfInCloneZone() {
            if (activeIndex >= BUFFER && activeIndex < BUFFER + realCount) return;
            const mapped = BUFFER + realIndexOf(activeIndex);
            carouselStage.classList.add('no-transition');
            activeIndex = mapped;
            render();
            // eslint-disable-next-line no-unused-expressions
            carouselStage.offsetHeight; // force reflow so the next transition re-enables cleanly
            requestAnimationFrame(() => carouselStage.classList.remove('no-transition'));
        }

        function goToIndex(index) {
            activeIndex = index;
            render();
            window.clearTimeout(goToIndex._t);
            goToIndex._t = window.setTimeout(settleIfInCloneZone, 720);
        }

        function goToReal(realIdx) {
            goToIndex(BUFFER + realIdx);
        }

        cards.forEach((card, i) => {
            card.addEventListener('click', () => {
                if (i === activeIndex) {
                    card.classList.toggle('is-flipped');
                } else {
                    goToIndex(i);
                }
            });
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => goToReal(parseInt(dot.getAttribute('data-goto'), 10)));
        });

        // Swipe support
        let touchStartX = null;
        carouselStage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        carouselStage.addEventListener('touchend', (e) => {
            if (touchStartX === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) { goToIndex(delta < 0 ? activeIndex + 1 : activeIndex - 1); }
            touchStartX = null;
        }, { passive: true });

        window.addEventListener('resize', render);
        render();

        // Glassmorphic reveal for the dot navigation once it scrolls into view
        if (dotsGlass) {
            const glassObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        dotsGlass.classList.add('is-visible');
                        glassObserver.disconnect();
                    }
                });
            }, { threshold: 0.4 });
            glassObserver.observe(dotsGlass);
        }
    }


    // --- Comparison Table: synced row hover across the unified grid ---
    document.querySelectorAll('.premium-table > .table-row:not(.table-header)').forEach(row => {
        const cells = row.querySelectorAll('.col-dim, .col-asp, .col-tca');
        row.addEventListener('mouseenter', () => cells.forEach(c => c.classList.add('row-hover')));
        row.addEventListener('mouseleave', () => cells.forEach(c => c.classList.remove('row-hover')));
    });

    // --- FAQ Accordion Logic ---
    const faqHeaders = document.querySelectorAll('.faq-card-header');
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            card.classList.toggle('active');
        });
    });

    // --- Magnetic / Ripple Buttons ---
    const magneticButtons = document.querySelectorAll('.btn-primary');
    magneticButtons.forEach(btn => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.12}px, ${y * 0.3 - 3}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        }
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        });
    });

    // --- Timeline Scroll-Driven Fill ---
    const timelineContainer = document.getElementById('timeline-container');
    const timelineFill = document.getElementById('timeline-fill');

    if (timelineContainer && timelineFill) {
        const updateTimelineFill = () => {
            const rect = timelineContainer.getBoundingClientRect();
            const viewportH = window.innerHeight;
            // Progress travels from "container top enters lower viewport" to "container bottom passes upper viewport"
            const travel = rect.height + viewportH * 0.6;
            const traveled = viewportH * 0.85 - rect.top;
            const progress = Math.min(Math.max(traveled / travel, 0), 1);
            timelineFill.style.width = (progress * 100) + '%';
        };
        window.addEventListener('scroll', updateTimelineFill, { passive: true });
        window.addEventListener('resize', updateTimelineFill);
        updateTimelineFill();
    }

    // --- Count-Up Stat ---
    const counterEl = document.getElementById('client-counter');
    if (counterEl) {
        const target = parseInt(counterEl.getAttribute('data-target'), 10) || 0;
        let counted = false;
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counted) {
                    counted = true;
                    if (prefersReducedMotion) {
                        counterEl.textContent = target + '+';
                        return;
                    }
                    const duration = 1400;
                    const startTime = performance.now();
                    const tick = (now) => {
                        const elapsed = now - startTime;
                        const t = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - t, 3);
                        counterEl.textContent = Math.round(eased * target) + '+';
                        if (t < 1) requestAnimationFrame(tick);
                        else counterEl.textContent = target + '+';
                    };
                    requestAnimationFrame(tick);
                }
            });
        }, { threshold: 0.4 });
        counterObserver.observe(counterEl);
    }

    // --- 2D Canvas Dots Background ---
    const initCanvasDots = () => {
        if (prefersReducedMotion) return;

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
            ctx.setTransform(1, 0, 0, 1, 0, 0);
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

        // Smaller, more refined grid
        const spacing = 24;
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
            const interactionRadius = 110;

            dots.forEach(dot => {
                const dx = mouseX - dot.baseX;
                const dy = mouseY - dot.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = dot.baseX;
                let targetY = dot.baseY;
                let size = 1;

                if (dist < interactionRadius) {
                    const force = (interactionRadius - dist) / interactionRadius;
                    targetX -= (dx / dist) * force * 12;
                    targetY -= (dy / dist) * force * 12;
                    size += force * 1.3;

                    if (isDark) {
                        ctx.fillStyle = `rgba(0, 208, 250, ${0.15 + force * 0.6})`;
                    } else {
                        ctx.fillStyle = `rgba(0, 74, 252, ${0.15 + force * 0.6})`;
                    }
                } else {
                    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
                }

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
