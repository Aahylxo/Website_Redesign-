lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('a, button, [data-hover], select, .interactive-card, .peek-pill, .faq-card-header, .icon-box');

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

    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    const navList = document.getElementById('nav-list');
    const navIndicator = document.getElementById('nav-indicator');
    const navLinks = navList ? navList.querySelectorAll(':scope > li > a') : [];

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
        drawer.querySelectorAll('a, button').forEach(el => {
            if (el.classList.contains('mobile-dropdown-trigger')) return; 
            el.addEventListener('click', closeDrawer);
        });
        const drawerLinks = drawer.querySelectorAll('.mobile-drawer-nav > ul > li > a');
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

    const productsItem = document.getElementById('nav-products-item');
    if (productsItem) {
        const trigger = productsItem.querySelector('.nav-dropdown-trigger');
        const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                if (!isTouch) return; 
                e.preventDefault();
                const nowOpen = productsItem.classList.toggle('open');
                trigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
            });
        }
        document.addEventListener('click', (e) => {
            if (!productsItem.contains(e.target)) {
                productsItem.classList.remove('open');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const mobileProductsItem = document.getElementById('mobile-products-item');
    if (mobileProductsItem) {
        const trigger = mobileProductsItem.querySelector('.mobile-dropdown-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => {
                const nowOpen = mobileProductsItem.classList.toggle('open');
                trigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
            });
        }
    }

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

    const pills = document.querySelectorAll('.peek-pill');
    const contents = document.querySelectorAll('.peek-content');
    const peekPillsRow = document.querySelector('.peek-pills');

    function activatePill(pill) {
        if (pill.classList.contains('active')) return;
        pills.forEach(p => p.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        pill.classList.add('active');
        const targetId = pill.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
    }

    pills.forEach(pill => {
        pill.addEventListener('mouseenter', () => activatePill(pill));
        pill.addEventListener('focus', () => activatePill(pill));
        pill.addEventListener('click', () => activatePill(pill));
    });

    if (peekPillsRow) {
        const updatePillsOverflow = () => {
            const hasMore = peekPillsRow.scrollWidth - peekPillsRow.scrollLeft - peekPillsRow.clientWidth > 24;
            peekPillsRow.classList.toggle('has-overflow', hasMore);
        };
        updatePillsOverflow();
        peekPillsRow.addEventListener('scroll', updatePillsOverflow, { passive: true });
        window.addEventListener('resize', updatePillsOverflow);
    }

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

    const carouselTrack = document.getElementById('carousel-track');
    const carouselViewport = document.getElementById('carousel-viewport');
    if (carouselTrack && carouselViewport) {
        const cards = Array.from(carouselTrack.querySelectorAll('.carousel-card'));
        const total = cards.length;
        const carouselReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dotsWrap = document.getElementById('carousel-dots');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');

        let current = 0;
        const isNarrow = () => window.innerWidth <= 640;

        function relPos(i) {
            let d = i - current;
            const half = total / 2;
            if (d > half) d -= total;
            if (d < -half) d += total;
            return d;
        }

        function paint() {
            const gap = isNarrow() ? 210 : 300;
            cards.forEach((card, i) => {
                const d = relPos(i);
                const absD = Math.abs(d);
                const x = d * gap;
                let scale, opacity, blur, z;
                if (absD === 0) { scale = 1; opacity = 1; blur = 0; z = 5; }
                else if (absD === 1) { scale = 0.82; opacity = 0.5; blur = 2.5; z = 3; }
                else { scale = 0.68; opacity = 0; blur = 6; z = 1; }

                card.style.transform = `translateX(${x}px) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.filter = carouselReducedMotion ? 'none' : `blur(${blur}px)`;
                card.style.zIndex = z;
                card.classList.toggle('is-center', absD === 0);
                card.style.pointerEvents = absD <= 1 ? 'auto' : 'none';
            });

            if (dotsWrap) {
                Array.from(dotsWrap.children).forEach((dot, i) => {
                    dot.classList.toggle('is-active', i === current);
                    dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
                });
            }
        }

        function goTo(index) {
            current = ((index % total) + total) % total;
            paint();
        }
        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        cards.forEach((card, i) => {
            card.addEventListener('click', () => {
                const d = relPos(i);
                if (d === 0) return;
                goTo(i);
                restartAutoplay();
            });
        });

        if (dotsWrap) {
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'carousel-dot';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Show stat ${i + 1} of ${total}`);
                dot.addEventListener('click', () => { goTo(i); restartAutoplay(); });
                dotsWrap.appendChild(dot);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

        paint();

        let autoplayTimer = null;
        function restartAutoplay() {
            if (carouselReducedMotion) return;
            window.clearInterval(autoplayTimer);
            autoplayTimer = window.setInterval(next, 3200);
        }
        restartAutoplay();

        carouselViewport.addEventListener('mouseenter', () => window.clearInterval(autoplayTimer));
        carouselViewport.addEventListener('mouseleave', restartAutoplay);

        let touchStartX = null;
        carouselViewport.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            window.clearInterval(autoplayTimer);
        }, { passive: true });
        carouselViewport.addEventListener('touchend', (e) => {
            if (touchStartX !== null) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
                touchStartX = null;
            }
            window.setTimeout(restartAutoplay, 1800);
        }, { passive: true });

        window.addEventListener('resize', paint);
    }

    document.querySelectorAll('.premium-table > .table-row:not(.table-header)').forEach(row => {
        const cells = row.querySelectorAll('.col-dim, .col-asp, .col-tca');
        row.addEventListener('mouseenter', () => cells.forEach(c => c.classList.add('row-hover')));
        row.addEventListener('mouseleave', () => cells.forEach(c => c.classList.remove('row-hover')));
    });

    const faqCards = document.querySelectorAll('.faq-card');
    const faqCollapseTimers = new WeakMap();

    faqCards.forEach(card => {
        const header = card.querySelector('.faq-card-header');
        if (!header) return;

        const openCard = () => {
            const existing = faqCollapseTimers.get(card);
            if (existing) { clearTimeout(existing); faqCollapseTimers.delete(card); }
            card.classList.add('active');
        };

        const scheduleCollapse = () => {
            const existing = faqCollapseTimers.get(card);
            if (existing) clearTimeout(existing);
            const timer = setTimeout(() => {
                card.classList.remove('active');
                faqCollapseTimers.delete(card);
            }, 5000);
            faqCollapseTimers.set(card, timer);
        };

        card.addEventListener('mouseenter', openCard);
        card.addEventListener('mouseleave', scheduleCollapse);
        header.addEventListener('focus', openCard);
        header.addEventListener('blur', scheduleCollapse);
        header.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                const existing = faqCollapseTimers.get(card);
                if (existing) clearTimeout(existing);
                faqCollapseTimers.delete(card);
                card.classList.remove('active');
            } else {
                openCard();
            }
        });
    });

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

    const vtimeline = document.getElementById('vtimeline');
    const vtimelineFill = document.getElementById('vtimeline-fill');

    if (vtimeline && vtimelineFill) {
        const vItems = Array.from(vtimeline.querySelectorAll('.vtimeline-item'));

        const updateVtimelineFill = () => {
            const rect = vtimeline.getBoundingClientRect();
            const viewportH = window.innerHeight;
            const travel = rect.height + viewportH * 0.38;
            const traveled = viewportH * 0.85 - rect.top;
            const progress = Math.min(Math.max((traveled / travel) * 1.08, 0), 1);
            vtimelineFill.style.height = (progress * 100) + '%';

            const n = vItems.length;
            vItems.forEach((item, i) => {
                const nodeProgress = n > 1 ? i / (n - 1) : 0;
                item.classList.toggle('is-active', progress >= nodeProgress - 0.02);
            });
        };
        let vtimelineTicking = false;
        window.addEventListener('scroll', () => {
            if (!vtimelineTicking) {
                vtimelineTicking = true;
                requestAnimationFrame(() => { updateVtimelineFill(); vtimelineTicking = false; });
            }
        }, { passive: true });
        window.addEventListener('resize', updateVtimelineFill);
        updateVtimelineFill();

        const vtimelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.25 });
        vItems.forEach(item => vtimelineObserver.observe(item));

        vtimeline.querySelectorAll('.vtimeline-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const card = toggle.closest('.vtimeline-card');
                const expanded = card.classList.toggle('is-expanded');
                toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            });
        });
    }

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
                    const duration = 3200;
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

    // --- Hero Text Sequence: Typewriter (Heading Only) ---
    const initHeroText = () => {
        const heading = document.getElementById('hero-heading');
        if (!heading) return;

        const headingText = heading.getAttribute('data-kinetic-text') || '';

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            heading.textContent = headingText;
            return;
        }

        heading.innerHTML = '';
        const startDelay = 1.2; 
        const charDelay = 0.035; 
        
        [...headingText].forEach((ch, i) => {
            if (ch === ' ') {
                heading.appendChild(document.createTextNode('\u00A0'));
                return;
            }
            const span = document.createElement('span');
            span.className = 'heading-char';
            span.textContent = ch;
            span.style.animationDelay = (startDelay + (i * charDelay)) + 's';
            heading.appendChild(span);
        });
    };
    initHeroText();

    const initIntroSplash = () => {
        const overlay = document.getElementById('intro-overlay');
        const canvas = document.getElementById('intro-ascii-canvas');
        if (!overlay) return;

        const finish = () => {
            document.documentElement.style.overflow = '';
            overlay.classList.add('is-leaving');
            overlay.setAttribute('aria-hidden', 'true');
            window.setTimeout(() => { overlay.classList.add('is-done'); overlay.remove(); }, 750);
        };

        if (prefersReducedMotion) { finish(); return; }

        document.documentElement.style.overflow = 'hidden';

        if (canvas && canvas.getContext) {
            const ctx = canvas.getContext('2d');
            const chars = ['0', '1', '\u00B7', '+'];
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            let rings = [], w = 0, h = 0, raf = null;

            function buildRings() {
                rings = [];
                const cx = w / 2, cy = h / 2;
                const maxR = Math.min(w, h) * 0.34;
                if (maxR <= 0) return;
                const ringCount = Math.max(6, Math.round(maxR / 22));
                for (let i = 0; i < ringCount; i++) {
                    const r = ((i + 1) / ringCount) * maxR;
                    const count = Math.max(8, Math.floor((2 * Math.PI * r) / 16));
                    const points = [];
                    const phase = i * 0.35;
                    for (let j = 0; j < count; j++) {
                        const angle = (j / count) * Math.PI * 2 + phase;
                        points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, ch: chars[(i + j) % chars.length] });
                    }
                    rings.push({ points, t: i / ringCount });
                }
            }
            function resize() {
                w = window.innerWidth; h = window.innerHeight;
                canvas.width = w * dpr; canvas.height = h * dpr;
                canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                buildRings();
            }
            function draw(time) {
                ctx.clearRect(0, 0, w, h);
                ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                rings.forEach((ring, i) => {
                    const pulse = 0.5 + 0.5 * Math.sin((time || 0) / 1000 * 1.3 - i * 0.5);
                    const alpha = Math.max(0, (1 - ring.t) * 0.55 * pulse);
                    const mix = Math.min(1, ring.t / 0.55);
                    const r = 0 + (0 - 0) * mix, g = 208 + (74 - 208) * mix, b = 250 + (252 - 250) * mix;
                    ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha.toFixed(3)})`;
                    ring.points.forEach(p => ctx.fillText(p.ch, p.x, p.y));
                });
                raf = requestAnimationFrame(draw);
            }
            resize(); draw(0);
            window.addEventListener('resize', resize);
            window.addEventListener('beforeunload', () => raf && cancelAnimationFrame(raf));
        }

        const totalTimer = window.setTimeout(finish, 1650);
        overlay.addEventListener('click', () => { clearTimeout(totalTimer); finish(); }, { once: true });
    };
    initIntroSplash();
});
