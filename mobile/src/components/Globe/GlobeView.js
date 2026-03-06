import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const GLOBE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    canvas { display: block; }
    #globe-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="globe-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js"></script>
  <script>
    (function() {
      const container = document.getElementById('globe-container');
      const W = window.innerWidth;
      const H = window.innerHeight;
      const R = Math.min(W, H) * 0.38;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
      camera.position.z = R * 2.8;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404060, 0.8);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
      sunLight.position.set(5, 3, 5);
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x3B82F6, 0.4);
      rimLight.position.set(-5, -3, -5);
      scene.add(rimLight);

      // Earth sphere
      const earthGeo = new THREE.SphereGeometry(R, 64, 64);
      const textureLoader = new THREE.TextureLoader();

      // Use a simple procedural earth-like material
      const earthMat = new THREE.MeshPhongMaterial({
        color: 0x1A3A6B,
        emissive: 0x0A1A3A,
        specular: 0x4488AA,
        shininess: 15,
      });
      const earth = new THREE.Mesh(earthGeo, earthMat);
      scene.add(earth);

      // Land masses simulation using dots
      const dotCount = 8000;
      const dotGeo = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      // Simplified land/water distribution
      const landRegions = [
        // North America
        { lat: [25, 70], lon: [-130, -60], color: [0.2, 0.55, 0.3] },
        // South America
        { lat: [-55, 12], lon: [-80, -35], color: [0.15, 0.5, 0.25] },
        // Europe
        { lat: [36, 71], lon: [-10, 40], color: [0.3, 0.6, 0.35] },
        // Africa
        { lat: [-35, 37], lon: [-18, 51], color: [0.55, 0.5, 0.2] },
        // Asia
        { lat: [10, 75], lon: [40, 145], color: [0.4, 0.55, 0.25] },
        // Australia
        { lat: [-43, -10], lon: [113, 153], color: [0.7, 0.55, 0.25] },
      ];

      function isLand(lat, lon) {
        for (const region of landRegions) {
          if (lat >= region.lat[0] && lat <= region.lat[1] &&
              lon >= region.lon[0] && lon <= region.lon[1]) {
            return region.color;
          }
        }
        return null;
      }

      for (let i = 0; i < dotCount * 4; i++) {
        const lat = Math.random() * 180 - 90;
        const lon = Math.random() * 360 - 180;
        const landColor = isLand(lat, lon);

        if (landColor) {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);
          const r = R + 0.5;
          positions.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
          );
          colors.push(landColor[0], landColor[1], landColor[2]);
        }
        if (positions.length / 3 >= dotCount) break;
      }

      dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const dotMat = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });
      const dots = new THREE.Points(dotGeo, dotMat);
      scene.add(dots);

      // Atmosphere glow
      const atmGeo = new THREE.SphereGeometry(R * 1.08, 64, 64);
      const atmMat = new THREE.MeshPhongMaterial({
        color: 0x4488FF,
        transparent: true,
        opacity: 0.07,
        side: THREE.FrontSide,
      });
      const atmosphere = new THREE.Mesh(atmGeo, atmMat);
      scene.add(atmosphere);

      // Outer glow ring
      const glowGeo = new THREE.SphereGeometry(R * 1.15, 64, 64);
      const glowMat = new THREE.MeshPhongMaterial({
        color: 0x2244CC,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // City markers
      const cities = [
        { lat: 40.71, lon: -74.01, name: 'New York' },
        { lat: 51.51, lon: -0.13, name: 'London' },
        { lat: 48.85, lon: 2.35, name: 'Paris' },
        { lat: 35.69, lon: 139.69, name: 'Tokyo' },
        { lat: -33.87, lon: 151.21, name: 'Sydney' },
        { lat: 1.35, lon: 103.82, name: 'Singapore' },
        { lat: 25.20, lon: 55.27, name: 'Dubai' },
        { lat: 19.08, lon: 72.88, name: 'Mumbai' },
        { lat: -23.55, lon: -46.63, name: 'São Paulo' },
        { lat: 55.75, lon: 37.62, name: 'Moscow' },
      ];

      const markerGeo = new THREE.SphereGeometry(3, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });

      cities.forEach(city => {
        const phi = (90 - city.lat) * (Math.PI / 180);
        const theta = (city.lon + 180) * (Math.PI / 180);
        const r = R + 2;
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
        scene.add(marker);
      });

      // Stars background
      const starGeo = new THREE.BufferGeometry();
      const starPositions = [];
      for (let i = 0; i < 2000; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 800 + Math.random() * 200;
        starPositions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      }
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.7 });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // Touch interaction
      let isDragging = false;
      let previousTouch = null;
      let rotationVelocityX = 0;
      let rotationVelocityY = 0;

      renderer.domElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousTouch = e.touches[0];
        rotationVelocityX = 0;
        rotationVelocityY = 0;
      }, { passive: true });

      renderer.domElement.addEventListener('touchmove', (e) => {
        if (!isDragging || !previousTouch) return;
        const touch = e.touches[0];
        const dx = touch.clientX - previousTouch.clientX;
        const dy = touch.clientY - previousTouch.clientY;
        rotationVelocityX = dy * 0.005;
        rotationVelocityY = dx * 0.005;
        earth.rotation.x += rotationVelocityX;
        earth.rotation.y += rotationVelocityY;
        dots.rotation.x = earth.rotation.x;
        dots.rotation.y = earth.rotation.y;
        previousTouch = touch;
      }, { passive: true });

      renderer.domElement.addEventListener('touchend', () => {
        isDragging = false;
        previousTouch = null;
      });

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
          earth.rotation.y += 0.003;
          dots.rotation.y += 0.003;
          rotationVelocityX *= 0.95;
          rotationVelocityY *= 0.95;
        }

        atmosphere.rotation.y = earth.rotation.y * 0.98;
        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        const nW = window.innerWidth;
        const nH = window.innerHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
      });
    })();
  </script>
</body>
</html>
`;

export default function GlobeView({ style }) {
  const webviewRef = useRef(null);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        source={{ html: GLOBE_HTML }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        onMessage={() => {}}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        backgroundColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.42,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
