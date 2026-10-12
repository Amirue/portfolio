#version 100
precision mediump float;

/** @time */
uniform float u_time;
/** @resolution */
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float v = 1.0 - uv.y;
    float glow = smoothstep(0.72, 0.0, v);
    float pulse = 0.90 + 0.10 * sin(u_time * 0.30);
    float edge = smoothstep(1.0, 0.55, abs(uv.x - 0.5) * 2.0);
    vec3 base = vec3(0.037, 0.037, 0.042);
    vec3 tint = vec3(0.085, 0.032, 0.044);
    vec3 col = base + tint * glow * pulse * edge;
    gl_FragColor = vec4(col, 1.0);
}
