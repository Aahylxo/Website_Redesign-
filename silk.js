/* ============================================================
   Silk Backdrop — a lightweight, dependency-free WebGL port of the
   "Silk" shader effect. Renders a single fullscreen triangle with a
   fragment shader that weaves a slow-moving light pattern. No
   three.js / React here — this site is vanilla HTML/CSS/JS, so the
   raw WebGL1 context does the same job with far less weight.
   ============================================================ */
(function () {
    const mount = document.getElementById('silk-backdrop');
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    mount.appendChild(canvas);

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false })
        || canvas.getContext('experimental-webgl');

    if (!gl) { mount.style.display = 'none'; return; }

    const vertexSrc = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
            vUv = aPosition * 0.5 + 0.5;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const fragmentSrc = `
        precision highp float;
        varying vec2 vUv;

        uniform float uTime;
        uniform vec3  uColor;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uRotation;
        uniform float uNoiseIntensity;
        uniform vec2  uOffset;
        uniform float uAspect;

        const float e = 2.71828182845904523536;

        float noise(vec2 texCoord) {
            float G = e;
            vec2  r = (G * sin(G * texCoord));
            return fract(r.x * r.y * (1.0 + texCoord.x));
        }

        vec2 rotateUvs(vec2 uv, float angle) {
            float c = cos(angle);
            float s = sin(angle);
            mat2 rot = mat2(c, -s, s, c);
            return rot * uv;
        }

        void main() {
            vec2 fragCoord = vUv * vec2(uAspect, 1.0) * 800.0;
            float rnd = noise(fragCoord);

            vec2 centered = (vUv - 0.5) * vec2(uAspect, 1.0) + uOffset;
            vec2 uv = rotateUvs(centered * uScale, uRotation);
            vec2 tex = uv * uScale;
            float tOffset = uSpeed * uTime;

            tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

            float pattern = 0.6 +
                0.4 * sin(5.0 * (tex.x + tex.y +
                    cos(3.0 * tex.x + 5.0 * tex.y) +
                    0.02 * tOffset) +
                    sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

            vec3 col = uColor * pattern - (rnd / 15.0 * uNoiseIntensity);
            float alpha = clamp(pattern, 0.0, 1.0);
            gl_FragColor = vec4(col, alpha);
        }
    `;

    function compile(type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('Silk shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, vertexSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vs || !fs) { mount.style.display = 'none'; return; }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Silk program link error:', gl.getProgramInfoLog(program));
        mount.style.display = 'none';
        return;
    }
    gl.useProgram(program);

    // Fullscreen triangle (covers viewport without a quad's extra verts)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uColor = gl.getUniformLocation(program, 'uColor');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uRotation = gl.getUniformLocation(program, 'uRotation');
    const uNoiseIntensity = gl.getUniformLocation(program, 'uNoiseIntensity');
    const uOffset = gl.getUniformLocation(program, 'uOffset');
    const uAspect = gl.getUniformLocation(program, 'uAspect');

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255
        ];
    }

    const palette = {
        dark: hexToRgb('#0e3a6b'),
        light: hexToRgb('#bcd9f5')
    };

    let currentColor = palette.dark.slice();
    let targetColor = palette.dark.slice();

    function applyThemeColor() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        targetColor = (theme === 'light' ? palette.light : palette.dark).slice();
    }
    applyThemeColor();

    // Watch for theme toggles so the weave recolors smoothly rather than snapping
    const themeObserver = new MutationObserver(applyThemeColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    function resize() {
        width = mount.clientWidth;
        height = mount.clientHeight;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // Gentle cursor-reactive offset — the weave drifts a little toward the
    // pointer rather than tracking it directly, so it reads as ambient, not literal.
    let targetOffsetX = 0, targetOffsetY = 0, offsetX = 0, offsetY = 0;
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            targetOffsetX = ((e.clientX / window.innerWidth) - 0.5) * 0.09;
            targetOffsetY = ((e.clientY / window.innerHeight) - 0.5) * -0.09;
        }, { passive: true });
    }

    let scrollFade = 1;
    window.addEventListener('scroll', () => {
        const t = Math.min(1, window.scrollY / (window.innerHeight * 1.4));
        scrollFade = 1 - t * 0.35;
    }, { passive: true });

    gl.uniform1f(uSpeed, 0.9);
    gl.uniform1f(uScale, 1.4);
    gl.uniform1f(uRotation, 0.35);
    gl.uniform1f(uNoiseIntensity, 1.15);

    let start = performance.now();
    let raf = null;

    function frame(now) {
        const t = (now - start) / 1000;

        offsetX += (targetOffsetX - offsetX) * 0.04;
        offsetY += (targetOffsetY - offsetY) * 0.04;

        currentColor[0] += (targetColor[0] - currentColor[0]) * 0.03;
        currentColor[1] += (targetColor[1] - currentColor[1]) * 0.03;
        currentColor[2] += (targetColor[2] - currentColor[2]) * 0.03;

        gl.uniform1f(uTime, t);
        gl.uniform2f(uOffset, offsetX, offsetY);
        gl.uniform1f(uAspect, width / Math.max(height, 1));
        gl.uniform3f(uColor, currentColor[0] * scrollFade, currentColor[1] * scrollFade, currentColor[2] * scrollFade);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(frame);
    }

    if (prefersReducedMotion) {
        // Draw a single static frame — still gives the woven texture, no motion.
        gl.uniform1f(uTime, 0);
        gl.uniform2f(uOffset, 0, 0);
        gl.uniform1f(uAspect, width / Math.max(height, 1));
        gl.uniform3f(uColor, currentColor[0], currentColor[1], currentColor[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
        raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
        else if (!document.hidden && !prefersReducedMotion && !raf) { start = performance.now(); raf = requestAnimationFrame(frame); }
    });
})();
