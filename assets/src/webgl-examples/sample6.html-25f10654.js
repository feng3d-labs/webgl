import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as f}from"../../WebGL-b4686ab5.js";import{c as u,p as h,t as v,g as l}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let d=0;w();async function w(){const t=document.querySelector("#glcanvas"),e=new f({canvasId:"glcanvas",webGLcontextId:"webgl"}),r=M(),n=await b("../../cubetexture.png"),i={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
        }
      `},fragment:{code:`
        varying highp vec2 vTextureCoord;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
      `},depthStencil:{depthCompare:"less-equal"}},geometry:{primitive:{topology:"triangle-list"},vertices:{aVertexPosition:{format:"float32x3",data:r.position},aTextureCoord:{format:"float32x2",data:r.textureCoord}},indices:r.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36}},bindingResources:{uSampler:n}},s={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderObjects:[i]};let a=0;function o(c){c*=.001;const p=c-a;a=c;const{projectionMatrix:x,modelViewMatrix:g}=C(t,p);i.bindingResources.uProjectionMatrix=x,i.bindingResources.uModelViewMatrix=g,e.submit({commandEncoders:[{passEncoders:[s]}]}),requestAnimationFrame(o)}requestAnimationFrame(o)}function M(){const t=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],e=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(t),textureCoord:new Float32Array(e),indices:new Uint16Array(r)}}async function b(t){const e=new Image;e.src=t,await e.decode();const r=m(e.width)&&m(e.height),n={size:[e.width,e.height],format:"rgba8unorm",sources:[{image:e}],generateMipmap:r};let i={};return r&&(i={addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear"}),{texture:n,sampler:i}}function m(t){return(t&t-1)===0}function C(t,e){const r=45*Math.PI/180,n=t.clientWidth/t.clientHeight,i=.1,s=100,a=u();h(a,r,n,i,s);const o=u();return v(o,o,[-0,0,-6]),l(o,o,d,[0,0,1]),l(o,o,d*.7,[0,1,0]),d+=e,{projectionMatrix:a,modelViewMatrix:o}}
//# sourceMappingURL=sample6.html-25f10654.js.map
