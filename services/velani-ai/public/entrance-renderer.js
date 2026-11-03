/* A small, self-contained studio renderer. No assets, requests or dependencies. */
(() => {
  "use strict";

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;

  const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 pointer;

    mat2 rotate(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    float ease(float x) {
      x = clamp(x, 0.0, 1.0);
      return 1.0 - pow(1.0 - x, 4.0);
    }

    vec3 localPoint(vec3 p) {
      float settle = ease(time / 1.32);
      float drift = sin(max(time - 1.32, 0.0) * .6) * .035;
      p.xz = rotate(mix(-.94, -.30, settle) + drift + pointer.x * .075) * p.xz;
      p.yz = rotate(mix(.29, -.10, settle) + pointer.y * .045) * p.yz;
      p.xy = rotate(mix(-.20, .025, settle)) * p.xy;
      return p;
    }

    float segmentDistance2(vec2 p, vec2 a, vec2 b) {
      vec2 edge = b - a;
      vec2 offset = p - a;
      vec2 nearest = offset - edge * clamp(dot(offset, edge) / dot(edge, edge), 0.0, 1.0);
      return dot(nearest, nearest);
    }

    float monogram(vec2 p) {
      // Symmetry reduces the six-edge polygon to three distances and two
      // half-plane tests, keeping the per-pixel marcher inexpensive.
      p.x = abs(p.x);
      float top = segmentDistance2(p, vec2(.75, 1.20), vec2(1.34, 1.20));
      float inner = segmentDistance2(p, vec2(0.0, -.65), vec2(.75, 1.20));
      float outer = segmentDistance2(p, vec2(0.0, -1.42), vec2(1.34, 1.20));
      bool insideOuter = p.y <= 1.20 && p.x <= (p.y + 1.42) * (1.34 / 2.62);
      bool insideNotch = p.x < (p.y + .65) * (.75 / 1.85);
      return sqrt(min(top, min(inner, outer))) * (insideOuter && !insideNotch ? -1.0 : 1.0);
    }

    float sculpture(vec3 world) {
      vec3 p = localPoint(world);
      // One continuous milled form, including the apex: no crossing endcaps.
      // A gently crowned and twisted face makes studio reflections curve.
      float across = abs(p.x) - .475 * (p.y + 1.13);
      float crown = (.075 + .035 * sin(p.y * 1.8)) * pow(clamp(across / .32, -1.2, 1.2), 2.0);
      p.z += crown + .09 * sin(p.y * 1.6) + .10 * p.x * p.y;
      vec2 profile = vec2(monogram(p.xy), abs(p.z) - .19);
      return min(max(profile.x, profile.y), 0.0) + length(max(profile, 0.0)) - .038;
    }

    vec3 normalAt(vec3 p) {
      vec2 e = vec2(.0015, -.0015);
      return normalize(
        e.xyy * sculpture(p + e.xyy) +
        e.yyx * sculpture(p + e.yyx) +
        e.yxy * sculpture(p + e.yxy) +
        e.xxx * sculpture(p + e.xxx)
      );
    }

    float softbox(vec3 direction, vec3 axis, vec2 size, float softness) {
      axis = normalize(axis);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), axis));
      vec3 up = cross(axis, right);
      float facing = dot(direction, axis);
      vec2 uv = vec2(dot(direction, right), dot(direction, up)) / max(facing, .001);
      vec2 edge = smoothstep(size, size + softness, abs(uv));
      return (1.0 - edge.x) * (1.0 - edge.y) * step(.01, facing);
    }

    vec3 studio(vec3 r) {
      // Reflections of real-sized studio cards, rather than glowing geometry.
      vec3 color = mix(vec3(.0015, .002, .003), vec3(.025, .033, .036), smoothstep(-.7, .9, r.y));
      color += vec3(1.45, 1.48, 1.47) * softbox(r, vec3(-.70, .25, 1.0), vec2(.30, 1.7), .15);
      color += vec3(.88, .98, 1.0) * softbox(r, vec3(.80, .10, .8), vec2(.18, 1.3), .10);
      color += vec3(.95, .90, .79) * softbox(r, vec3(.08, 1.0, .35), vec2(1.2, .30), .09);
      color += vec3(.58, .66, .67) * softbox(r, vec3(-.04, -.9, .55), vec2(1.1, .12), .045);
      color += vec3(.013, .018, .020) * pow(max(dot(r, normalize(vec3(.2, .6, 1.0))), 0.0), 3.0);
      return color;
    }

    void main() {
      vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
      float settle = ease(time / 1.32);
      float push = clamp((time - 2.25) / 1.0, 0.0, 1.0);
      push = push * push * (3.0 - 2.0 * push);
      float narrowFit = max(1.0, .86 * resolution.y / resolution.x);
      float distance = mix(mix(3.25, 5.20 * narrowFit, settle), .22, push);
      vec3 origin = vec3(0.0, .04, distance);
      vec3 ray = normalize(vec3(uv, -2.55));

      // Bound the SDF to keep transparent pixels inexpensive on mobile GPUs.
      float b = dot(origin, ray);
      float c = dot(origin, origin) - 3.65;
      float discriminant = b * b - c;
      if (discriminant < 0.0) { gl_FragColor = vec4(0.0); return; }
      float span = sqrt(discriminant);
      float travel = max(-b - span, 0.0);
      float limit = -b + span;
      float surface = 1.0;
      float closestRatio = 2.0;
      float closestTravel = travel;
      for (int i = 0; i < 72; i++) {
        if (travel > limit) break;
        surface = sculpture(origin + ray * travel);
        // One projected pixel at this depth. Track near-miss rays to give the
        // true SDF silhouette fractional coverage, even at adaptive resolution.
        float footprint = max(.001, travel * (2.0 / 2.55) / resolution.y);
        float ratio = surface / footprint;
        if (ratio < closestRatio) {
          closestRatio = ratio;
          closestTravel = travel;
        }
        if (surface < .0006) break;
        travel += surface * .70;
      }
      if (closestRatio > 1.0) { gl_FragColor = vec4(0.0); return; }
      float coverage = surface < .0006 && travel <= limit
        ? 1.0 : 1.0 - smoothstep(0.0, 1.0, max(closestRatio, 0.0));

      vec3 point = origin + ray * closestTravel;
      vec3 normal = normalAt(point);
      vec3 reflected = reflect(ray, normal);
      float facing = clamp(dot(normal, -ray), 0.0, 1.0);
      float fresnel = .68 + .32 * pow(1.0 - facing, 5.0);
      float occlusion = clamp(sculpture(point + normal * .12) / .12, .35, 1.0);
      vec3 metal = studio(reflected) * mix(vec3(.63, .72, .73), vec3(.93, .96, .96), fresnel);
      vec3 key = normalize(vec3(-.65, 1.0, 1.2));
      metal += vec3(.012, .017, .019) * max(dot(normal, key), 0.0);
      metal *= mix(.68, 1.0, occlusion);
      // Soft photographic tone mapping, with a neutral output for the porcelain stage.
      metal = metal / (metal + vec3(.68));
      metal = pow(metal, vec3(1.0 / 2.2));
      gl_FragColor = vec4(metal, coverage);
    }
  `;

  class VelaniEntranceRenderer {
    constructor(canvas) {
      if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError("A canvas is required");
      this.canvas = canvas;
      this.disposed = false;
      this.lost = false;
      this.pixelBudget = 600000;
      this.lastProgress = null;
      this.frameGap = 1 / 60;
      this.frameCount = 0;
      const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
      if (!gl) throw new Error("WebGL is unavailable");
      this.gl = gl;
      this.onContextLost = (event) => {
        event.preventDefault();
        this.lost = true;
        canvas.dispatchEvent(new CustomEvent("velani-renderer-unavailable"));
      };
      canvas.addEventListener("webglcontextlost", this.onContextLost);
      try {
        this.initialize();
      } catch (error) {
        this.dispose();
        throw error;
      }
    }

    initialize() {
      const gl = this.gl;
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const message = gl.getShaderInfoLog(shader);
          gl.deleteShader(shader);
          throw new Error("Entrance shader could not compile: " + message);
        }
        return shader;
      };
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      let fragment;
      try { fragment = compile(gl.FRAGMENT_SHADER, fragmentSource); }
      catch (error) { gl.deleteShader(vertex); throw error; }
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertex);
      gl.attachShader(this.program, fragment);
      gl.linkProgram(this.program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error("Entrance shader could not link");
      }
      gl.useProgram(this.program);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(this.program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      this.uniforms = {
        resolution: gl.getUniformLocation(this.program, "resolution"),
        time: gl.getUniformLocation(this.program, "time"),
        pointer: gl.getUniformLocation(this.program, "pointer"),
      };
      gl.clearColor(0, 0, 0, 0);
    }

    render(progressSeconds, pointerX = 0, pointerY = 0) {
      if (this.disposed || this.lost || this.gl.isContextLost()) return false;
      const progress = Math.max(0, Number(progressSeconds) || 0);
      const width = Math.max(this.canvas.clientWidth, 1);
      const height = Math.max(this.canvas.clientHeight, 1);
      const hasLayout = width > 1 && height > 1;
      const gap = !hasLayout || this.lastProgress === null ? 0 : progress - this.lastProgress;
      if (gap > 0 && gap < .25) {
        this.frameGap = this.frameGap * .65 + gap * .35;
        this.frameCount++;
        // Preserve smooth motion on integrated/mobile GPUs. Resolution only
        // steps down during a sequence, so quality never oscillates.
        if (this.frameCount % 5 === 0 && this.frameGap > .04) {
          this.pixelBudget = Math.max(350000, Math.round(this.pixelBudget * .76));
        }
      } else if (gap < 0) {
        this.frameGap = 1 / 60;
        this.frameCount = 0;
      }
      this.lastProgress = hasLayout ? progress : null;
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = Math.min(density, Math.sqrt(this.pixelBudget / (width * height)));
      const renderWidth = Math.max(1, Math.round(width * scale));
      const renderHeight = Math.max(1, Math.round(height * scale));
      if (this.canvas.width !== renderWidth || this.canvas.height !== renderHeight) {
        this.canvas.width = renderWidth;
        this.canvas.height = renderHeight;
      }
      const gl = this.gl;
      gl.viewport(0, 0, renderWidth, renderHeight);
      gl.useProgram(this.program);
      gl.uniform2f(this.uniforms.resolution, renderWidth, renderHeight);
      gl.uniform1f(this.uniforms.time, progress);
      gl.uniform2f(this.uniforms.pointer,
        Math.max(-1, Math.min(1, Number(pointerX) || 0)),
        Math.max(-1, Math.min(1, Number(pointerY) || 0)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    }

    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }

  window.VelaniEntranceRenderer = VelaniEntranceRenderer;
})();
