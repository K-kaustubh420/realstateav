// path: src/lib/id_verify/metadata.ts
import { Metadata } from '@/utils/id_verify';

interface GeolocationData {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
}

// Function to get WebGL information
const getWebGLInfo = (): { gpuVendor: string; gpuRenderer: string; webglVersion: string } => {
    const canvas = document.createElement("canvas");
    const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");

    let gpuVendor = "Unknown";
    let gpuRenderer = "Unknown";
    let webglVersion = "Unavailable";

    if (gl) {
        // --- FIX START ---
        // Assert that 'gl' is a WebGLRenderingContext or WebGL2RenderingContext
        // if it's not null, allowing access to WebGL-specific properties and methods.
        const webglContext = gl as WebGLRenderingContext | WebGL2RenderingContext;
        // --- FIX END ---

        const debugInfo = webglContext.getExtension("WEBGL_debug_renderer_info");

        gpuVendor = debugInfo
            ? webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            : webglContext.getParameter(webglContext.VENDOR); // Use webglContext.VENDOR

        gpuRenderer = debugInfo
            ? webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : webglContext.getParameter(webglContext.RENDERER); // Use webglContext.RENDERER

        webglVersion =
            webglContext instanceof WebGL2RenderingContext ? "WebGL 2.0" : "WebGL 1.0";
    }
    return { gpuVendor, gpuRenderer, webglVersion };
};

// Function to generate a browser fingerprint (SHA-256)
const generateBrowserFingerprint = async (): Promise<string> => {
    try {
        const { gpuVendor, gpuRenderer, webglVersion } = getWebGLInfo(); // Get WebGL info for fingerprint

        const parts = [
            navigator.userAgent,
            navigator.language,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            // Canvas Fingerprinting (Basic)
            (() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return 'no-canvas';
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125,1,62,20);
                ctx.fillStyle = "#069";
                ctx.fillText("KYC-FINGERPRINT", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("KYC-FINGERPRINT", 4, 17);
                return canvas.toDataURL();
            })(),
            // WebGL Fingerprinting - use the gathered info
            gpuVendor, // Include GPU vendor in fingerprint
            gpuRenderer, // Include GPU renderer in fingerprint
            webglVersion, // Include WebGL version in fingerprint
            // You can keep the WebGL rendering for image data as part of the fingerprint,
            // or remove it if you feel the vendor/renderer/version is sufficient for uniqueness.
            // I'll keep it as it was in your original to preserve its contribution to the fingerprint hash.
            (() => {
                const canvas = document.createElement("canvas");
                const gl =
                    canvas.getContext("webgl2") ||
                    canvas.getContext("webgl") ||
                    canvas.getContext("experimental-webgl");

                if (!gl) {
                    return "no-webgl";
                }
                const webglContext = gl as WebGLRenderingContext | WebGL2RenderingContext;
                try {
                    const width = 256;
                    const height = 128;
                    canvas.width = width;
                    canvas.height = height;
                    webglContext.viewport(0, 0, width, height);
                    webglContext.clearColor(0.0, 0.0, 0.0, 0.0);
                    webglContext.enable(webglContext.DEPTH_TEST);
                    webglContext.clear(webglContext.COLOR_BUFFER_BIT | webglContext.DEPTH_BUFFER_BIT);
                    const vertices = new Float32Array([0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0]);
                    const vertexBuffer = webglContext.createBuffer();
                    webglContext.bindBuffer(webglContext.ARRAY_BUFFER, vertexBuffer);
                    webglContext.bufferData(webglContext.ARRAY_BUFFER, vertices, webglContext.STATIC_DRAW);
                    const vsSource = `attribute vec4 aVertexPosition;void main() {gl_Position = aVertexPosition;}`;
                    const fsSource = `void main() {gl_FragColor = vec4(0.5, 0.0, 0.5, 1.0);}`;
                    const vertexShader = webglContext.createShader(webglContext.VERTEX_SHADER);
                    const fragmentShader = webglContext.createShader(webglContext.FRAGMENT_SHADER);
                    if (!vertexShader || !fragmentShader) return 'webgl-shader-fail';
                    webglContext.shaderSource(vertexShader, vsSource);
                    webglContext.shaderSource(fragmentShader, fsSource);
                    webglContext.compileShader(vertexShader);
                    webglContext.compileShader(fragmentShader);
                    if (!webglContext.getShaderParameter(vertexShader, webglContext.COMPILE_STATUS)) return 'webgl-vs-compile-fail';
                    if (!webglContext.getShaderParameter(fragmentShader, webglContext.COMPILE_STATUS)) return 'webgl-fs-compile-fail';
                    const shaderProgram = webglContext.createProgram();
                    if (!shaderProgram) return 'webgl-program-fail';
                    webglContext.attachShader(shaderProgram, vertexShader);
                    webglContext.attachShader(shaderProgram, fragmentShader);
                    webglContext.linkProgram(shaderProgram);
                    if (!webglContext.getProgramParameter(shaderProgram, webglContext.LINK_STATUS)) return 'webgl-program-link-fail';
                    webglContext.useProgram(shaderProgram);
                    const aVertexPosition = webglContext.getAttribLocation(shaderProgram, 'aVertexPosition');
                    webglContext.vertexAttribPointer(aVertexPosition, 3, webglContext.FLOAT, false, 0, 0);
                    webglContext.enableVertexAttribArray(aVertexPosition);
                    webglContext.drawArrays(webglContext.TRIANGLES, 0, 3);
                    webglContext.flush();
                    return canvas.toDataURL();
                } catch (e) {
                    console.warn("WebGL rendering or dataURL failed", e);
                    return "webgl-render-error";
                }
            })()
        ];
        
        const msgBuffer = new TextEncoder().encode(parts.join('###'));
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn("Fingerprint gen failed", e);
        return "fallback-fingerprint-" + Date.now();
    }
};

// Function to infer device type, brand, model, OS from User Agent, Platform, and GPU info
const inferDeviceDetails = (
    userAgent: string,
    platform: string,
    gpuVendor: string,
    gpuRenderer: string
) => {
    let device_type = 'desktop';
    let device_brand = 'unknown';
    let device_model = 'unknown';
    let os_name = 'unknown';
    let os_version = 'unknown';

    // OS detection
    if (userAgent.includes('Windows NT')) {
        os_name = 'Windows';
        const match = /Windows NT (\d+\.\d+)/.exec(userAgent);
        if (match) os_version = match[1];
    } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
        os_name = 'macOS';
        const match = /Mac OS X (\d+_\d+)/.exec(userAgent);
        if (match) os_version = match[1].replace(/_/g, '.');
    } else if (userAgent.includes('Android')) {
        os_name = 'Android';
        device_type = 'mobile';
        const match = /Android (\d+\.\d+)/.exec(userAgent);
        if (match) os_version = match[1];
        const brandMatch = /Android; ([^;]+) Build/.exec(userAgent);
        if (brandMatch) device_brand = brandMatch[1];
        const modelMatch = /Android.*?;\s([^;]*?)Build/.exec(userAgent) || /Android[^;]+;\s([^;]*?)\sBuild/.exec(userAgent);
        if (modelMatch && !modelMatch[1].includes('Android')) device_model = modelMatch[1].trim(); // Avoid "Android" as model
    } else if (userAgent.includes('iPhone')) {
        os_name = 'iOS';
        device_type = 'mobile';
        const match = /iPhone OS (\d+_\d+)/.exec(userAgent);
        if (match) os_version = match[1].replace(/_/g, '.');
        device_brand = 'Apple';
        device_model = 'iPhone';
    } else if (userAgent.includes('iPad')) {
        os_name = 'iOS';
        device_type = 'tablet';
        const match = /iPad OS (\d+_\d+)/.exec(userAgent); 
        if (match) os_version = match[1].replace(/_/g, '.');
        else {
            const iosMatch = /CPU OS (\d+_\d+)/.exec(userAgent);
            if (iosMatch) os_version = iosMatch[1].replace(/_/g, '.');
        }
        device_brand = 'Apple';
        device_model = 'iPad';
    } else if (userAgent.includes('Linux')) {
        os_name = 'Linux';
    }

    // Advanced Desktop Inference using Platform and GPU (as per your snippet)
    if (device_type === 'desktop') { // Only apply these inferences for desktop
        // Apple Silicon inference
        if (
            /Mac/.test(platform) &&
            /Apple/i.test(gpuVendor) && // Use /i for case-insensitive match on vendor
            /M\d/i.test(gpuRenderer) // use /M\d/i for case-insensitive M1, M2 etc.
        ) {
            device_brand = 'Apple';
            device_model = 'Apple Silicon Mac'; // More general, can refine with M1/M2 later
            if (/M1/i.test(gpuRenderer)) device_model = 'Apple M1 Mac';
            else if (/M2/i.test(gpuRenderer)) device_model = 'Apple M2 Mac';
            else if (/M3/i.test(gpuRenderer)) device_model = 'Apple M3 Mac';
        }
        // Intel Mac inference
        else if (/Mac/.test(platform) && /Intel/i.test(gpuVendor)) {
            device_brand = 'Apple';
            device_model = 'Intel Mac';
        }
        // Windows Desktop/Laptop Inference (can be refined)
        else if (/Win/.test(platform)) {
            device_brand = 'PC'; // Generic PC brand
            if (/Intel/i.test(gpuVendor) && /Graphics/i.test(gpuRenderer)) {
                device_model = 'Windows PC (Intel GPU)';
            } else if (/NVIDIA|AMD/i.test(gpuVendor)) {
                device_model = `Windows PC (${gpuVendor} GPU)`;
            } else {
                device_model = 'Windows PC (Unknown GPU)';
            }
        }
    }

    // Generic mobile detection (after specific OS and desktop inference)
    if (/(mobile|android|iphone|ipad|tablet|symbian|opera mobi|opera mini|blackberry|fennec|iemobile|midp|psp|windows phone|kindle|silk|webos|bada|nokia|maemo|windows ce)/i.test(userAgent) && device_type === 'desktop') {
        device_type = 'mobile';
    }

    return { device_type, device_brand, device_model, os_name, os_version };
};


export const collectMetadata = async (): Promise<Metadata> => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform; // Get platform for desktop inference
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const { gpuVendor, gpuRenderer,  } = getWebGLInfo(); // Collect WebGL info
    
    const fingerprintHash = await generateBrowserFingerprint(); // Now fingerprint includes more GPU info
    const Screenresolution = `${screen.width}x${screen.height}`;
    const cpucores = navigator.hardwareConcurrency || 0;
    
    // Pass the new GPU info to the inference function
    const inferredDevice = inferDeviceDetails(userAgent, platform, gpuVendor, gpuRenderer);

    let ipAddress = 'Determining...';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
    } catch (e) {
        console.warn("IP fetch failed", e);
        ipAddress = 'Hidden';
    }

    let geolocation: GeolocationData = {
        country: 'unknown',
        region: 'unknown',
        city: 'unknown',
        latitude: 0,
        longitude: 0,
    };

    if ("geolocation" in navigator) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
            });
            const { latitude, longitude } = position.coords;

            // Using a free API, replace with a more robust one for production
            // Note: bigdatacloud might rate-limit or require API key for heavy usage.
           const geoApiRes = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
);
            const geoData = await geoApiRes.json();
            
           geolocation = {
    country: geoData.address?.country || 'unknown',
    // Nominatim returns 'state' or 'county' for region usually
    region: geoData.address?.state || geoData.address?.region || 'unknown', 
    // City can be under city, town, village, or hamlet
    city: geoData.address?.city || geoData.address?.town || geoData.address?.village || 'unknown',
    latitude: latitude,
    longitude: longitude,
};

        } catch (err) {
            console.warn("GPS Permission denied or unavailable or reverse geocoding failed", err);
            // Fallback geolocation if permission denied or API fails
            geolocation = { ...geolocation, city: 'denied_by_user', country: 'denied_by_user' };
        }
    } else {
        geolocation = { ...geolocation, city: 'unsupported', country: 'unsupported' };
    }

    return {
        device_fingerprint: fingerprintHash, // The full fingerprint string might be too long for this, but the hash is good.
        device_info_ua: userAgent,
        timezone: timezone,
        ip_address: ipAddress,
        device_fingerprint_hash: fingerprintHash, // Using the same hash for both for simplicity, or could generate a different one if device_fingerprint is intended as raw string.
        inferredDevice: inferredDevice,
        Screenresolution: Screenresolution,
        cpucores: cpucores,
        geolocation: geolocation,
    };
};