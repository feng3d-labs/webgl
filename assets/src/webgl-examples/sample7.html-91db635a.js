import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as v}from"../../WebGL-b4686ab5.js";import{c as l,p as f,t as M,g as m,i as b,a as w}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let d=0;C();async function C(){const t=document.querySelector("#glcanvas"),e=new v({canvasId:"glcanvas",webGLcontextId:"webgl"}),r=V(),n=await y("../../cubetexture.png"),i={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
    
          // Apply lighting effect
    
          highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    
          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    
          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = ambientLight + (directionalLightColor * directional);
        }
      `},fragment:{code:`
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
          gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        }
      `},depthStencil:{depthCompare:"less-equal"}},bindingResources:{uSampler:n},geometry:{primitive:{topology:"triangle-list"},vertices:{aVertexPosition:{format:"float32x3",data:r.position},aVertexNormal:{format:"float32x3",data:r.normal},aTextureCoord:{format:"float32x2",data:r.textureCoord}},indices:r.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36}}},s={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderObjects:[i]};let c=0;function o(a){a*=.001;const g=a-c;c=a;const{projectionMatrix:p,modelViewMatrix:x,normalMatrix:h}=L(t,g);i.bindingResources.uProjectionMatrix=p,i.bindingResources.uModelViewMatrix=x,i.bindingResources.uNormalMatrix=h,e.submit({commandEncoders:[{passEncoders:[s]}]}),requestAnimationFrame(o)}requestAnimationFrame(o)}function V(){const t=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],e=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],r=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],n=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(t),normal:new Float32Array(e),textureCoord:new Float32Array(r),indices:new Uint16Array(n)}}async function y(t){const e=new Image;e.src=t,await e.decode();const r=u(e.width)&&u(e.height),n={size:[e.width,e.height],format:"rgba8unorm",sources:[{image:e}],generateMipmap:r};let i={};return r||(i={addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear"}),{texture:n,sampler:i}}function u(t){return(t&t-1)===0}function L(t,e){const r=45*Math.PI/180,n=t.clientWidth/t.clientHeight,i=.1,s=100,c=l();f(c,r,n,i,s);const o=l();M(o,o,[-0,0,-6]),m(o,o,d,[0,0,1]),m(o,o,d*.7,[0,1,0]);const a=l();return b(a,o),w(a,a),d+=e,{projectionMatrix:c,modelViewMatrix:o,normalMatrix:a}}
//# sourceMappingURL=sample7.html-91db635a.js.map
