#version 120
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 u_LightColor;// Light color
uniform vec3 u_LightPosition;// Position of the light source
uniform vec3 u_AmbientLight;
uniform vec3 u_Color;// Ambient light color
uniform float u_Shininess;
uniform bool normal_Visual;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec3 v_EyeVec;
void main() {
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    vec3 normal = normalize(v_Normal);
    vec4 color;
    if (normal_Visual) {
        color = vec4(v_Normal, 1.0);
    } else if (!normal_Visual){
        color = vec4(u_Color, 1.0);
    }
    // Calculate the light direction and make it 1.0 in length
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // The dot product of the light direction and the normal
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // Calculate the final color from diffuse reflection and ambient reflection
    vec3 diffuse = u_LightColor * color.rgb * nDotL;
    vec3 ambient = u_AmbientLight * color.rgb;
    // Calculate the specular color
    vec3 E = normalize(v_EyeVec);
    vec3 R = u_LightColor * reflect(lightDirection, normal);
    float specular = pow(max(dot(R, E), 0.0), u_Shininess);
    gl_FragColor = vec4(diffuse + ambient + specular, color.a);
}