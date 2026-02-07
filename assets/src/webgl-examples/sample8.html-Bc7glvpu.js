import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css                  */import{W as y,r as s}from"../../WebGL-lLSa4FVc.js";import{c as u,p as M,t as b,g as p,i as C,a as V}from"../../mat4-BHCnbM9z.js";import"../../common-C8IKy_GC.js";let m=0,g=!1;w();function w(){const t=document.querySelector("#glcanvas"),e=new y({canvasId:"glcanvas",webGLcontextId:"webgl"}),r=T(),o=A(),n=L("../../Firefox.mp4"),c={pipeline:{primitive:{topology:"triangle-list"},vertex:{code:`
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
      `},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x3",data:r.position},aVertexNormal:{format:"float32x3",data:r.normal},aTextureCoord:{format:"float32x2",data:r.textureCoord}},indices:r.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36},bindingResources:{uSampler:o}},d={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[c]};let i=0;function a(l){l*=.001;const v=l-i;i=l,g&&N(o.texture,n);const{projectionMatrix:x,modelViewMatrix:h,normalMatrix:f}=P(t,v);s(c.bindingResources).uProjectionMatrix={value:x},s(c.bindingResources).uModelViewMatrix={value:h},s(c.bindingResources).uNormalMatrix={value:f},e.submit({commandEncoders:[{passEncoders:[d]}]}),requestAnimationFrame(a)}requestAnimationFrame(a)}function L(t){const e=document.createElement("video");let r=!1,o=!1;e.autoplay=!0,e.muted=!0,e.loop=!0,e.addEventListener("playing",function(){r=!0,n()},!0),e.addEventListener("timeupdate",function(){o=!0,n()},!0),e.src=t,e.play();function n(){r&&o&&(g=!0)}return e}function T(){const t=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],e=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],r=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],o=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(t),normal:new Float32Array(e),textureCoord:new Float32Array(r),indices:new Uint16Array(o)}}function A(){return{texture:{descriptor:{size:[1,1],format:"rgba8unorm"},sources:[{__type__:"TextureDataSource",size:[1,1],data:new Uint8Array([0,0,255,255])}]},sampler:{addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear"}}}function N(t,e){(t.descriptor.size[0]!==e.videoWidth||t.descriptor.size[1]!==e.videoHeight)&&(s(t.descriptor).size=[e.videoWidth,e.videoHeight]),s(t).sources=[{image:e}]}function P(t,e){const r=45*Math.PI/180,o=t.clientWidth/t.clientHeight,n=.1,c=100,d=u();M(d,r,o,n,c);const i=u();b(i,i,[-0,0,-6]),p(i,i,m,[0,0,1]),p(i,i,m*.7,[0,1,0]);const a=u();return C(a,i),V(a,a),m+=e,{projectionMatrix:d,modelViewMatrix:i,normalMatrix:a}}
//# sourceMappingURL=sample8.html-Bc7glvpu.js.map
