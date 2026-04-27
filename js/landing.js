// Cinematic Three.js Scene Controller for EmpAnalytics
class TacticalScene {
    constructor() {
        this.container = document.getElementById('threeCanvas');
        this.sections = document.querySelectorAll('.cinematic-section');
        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.z = 800;
        this.camera.position.y = 100;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);

        // Elements
        this.createStarfield();
        this.createNebula();
        this.createDataPeaks();
        this.setupScrollTrigger();
        
        // Interaction
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    createStarfield() {
        const count = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorPool = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xff6b00), // Primary Orange
            new THREE.Color(0xffae00)  // Gold/Amber
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

            const color = colorPool[Math.floor(Math.random() * colorPool.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 2 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    pos.z += sin(time * 0.1 + pos.x) * 10.0;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    createNebula() {
        const geometry = new THREE.PlaneGeometry(3000, 1500, 64, 64);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0xff4400) }, // Deep Orange
                color2: { value: new THREE.Color(0xffaa00) }  // Bright Amber
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vElevation;
                uniform float time;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float elevation = sin(pos.x * 0.005 + time) * 30.0;
                    pos.z += elevation;
                    vElevation = elevation;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float time;
                varying vec2 vUv;
                varying float vElevation;
                void main() {
                    float mixFactor = sin(vUv.x * 3.0 + time * 0.2) * 0.5 + 0.5;
                    vec3 color = mix(color1, color2, mixFactor);
                    float alpha = 0.15 * (1.0 - length(vUv - 0.5) * 2.0);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.nebula = new THREE.Mesh(geometry, material);
        this.nebula.position.z = -500;
        this.scene.add(this.nebula);
    }

    createDataPeaks() {
        this.peaks = [];
        const layerCount = 4;
        const colors = [0x0a0a0a, 0x110800, 0x1a0d00, 0x241200];
        
        for (let i = 0; i < layerCount; i++) {
            const shape = new THREE.Shape();
            shape.moveTo(-2000, -500);
            for (let x = -2000; x <= 2000; x += 100) {
                const height = Math.sin(x * 0.005 + i) * 150 + Math.random() * 50;
                shape.lineTo(x, height);
            }
            shape.lineTo(2000, -500);
            
            const geometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 1 - (i * 0.2),
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = -(i * 200) - 200;
            mesh.position.y = -200;
            this.scene.add(mesh);
            this.peaks.push(mesh);
        }
    }

    setupScrollTrigger() {
        gsap.registerPlugin(ScrollTrigger);

        // Map scroll to camera
        gsap.to(this.camera.position, {
            z: -400,
            y: 300,
            scrollTrigger: {
                trigger: ".main-scroller",
                start: "top top",
                end: "bottom bottom",
                scrub: 2
            }
        });

        // Map scroll to nebula
        gsap.to(this.nebula.rotation, {
            z: Math.PI * 0.2,
            scrollTrigger: {
                trigger: ".main-scroller",
                start: "top top",
                end: "bottom bottom",
                scrub: 2
            }
        });

        // Section visibility toggles
        this.sections.forEach((section, i) => {
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "bottom center",
                onEnter: () => this.updateActiveSection(i),
                onEnterBack: () => this.updateActiveSection(i)
            });
        });
    }

    updateActiveSection(index) {
        this.sections.forEach(s => s.classList.remove('active'));
        this.sections[index].classList.add('active');
    }

    onMouseMove(e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        gsap.to(this.camera.position, {
            x: x,
            y: 100 + y,
            duration: 1,
            ease: "power2.out"
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = performance.now() * 0.001;
        
        if (this.stars) this.stars.material.uniforms.time.value = time;
        if (this.nebula) this.nebula.material.uniforms.time.value = time;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
window.onload = () => {
    new TacticalScene();
};

