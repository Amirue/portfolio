#version 100
precision mediump float;

/** @time */
uniform float u_time;
/** @resolution */
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.12;

    float d1 = distance(uv, vec2(0.16 + 0.07 * sin(t), 0.34 + 0.05 * cos(t * 1.3)));
    float d2 = distance(uv, vec2(0.88 + 0.05 * cos(t * 0.9), 0.78 + 0.06 * sin(t * 1.1)));
    float d3 = distance(uv, vec2(0.55, 0.50));

    float b1 = smoothstep(0.80, 0.0, d1);
    float b2 = smoothstep(0.72, 0.0, d2);
    float b3 = smoothstep(1.05, 0.0, d3);

    vec3 base = vec3(0.030, 0.030, 0.045);
    vec3 coral = vec3(0.44, 0.075, 0.130);
    vec3 cyan = vec3(0.030, 0.200, 0.300);

    vec3 col = base + coral * b1 * 0.62 + cyan * b2 * 0.48 + cyan * b3 * 0.12;

    gl_FragColor = vec4(col, 1.0);
}
