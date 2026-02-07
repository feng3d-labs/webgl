import"../../modulepreload-polyfill-B5Qt9EMX.js";import{W as f,r as p}from"../../WebGL-lLSa4FVc.js";import{c as x,p as w,t as C,g as m}from"../../mat4-BHCnbM9z.js";import"../../common-C8IKy_GC.js";let d=0;P();async function P(){const e=document.querySelector("#glcanvas"),i=window.devicePixelRatio||1;e.width=e.clientWidth*i,e.height=e.clientHeight*i;const r={canvasId:"glcanvas",webGLcontextId:"webgl2"},c=new f(r),n=b(),a={texture:{descriptor:{size:[e.width,e.height]}},sampler:{}},o={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec4 v_fragPosition;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
          v_fragPosition = 0.5 * (aVertexPosition + vec4(1.0, 1.0, 1.0, 1.0));
        }
      `},fragment:{code:`
        precision highp float;
        precision highp int;

        varying highp vec2 vTextureCoord;
        varying highp vec4 v_fragPosition;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          vec4 color = texture2D(uSampler, vTextureCoord) * v_fragPosition;
          gl_FragColor = color;
        }
      `},primitive:{topology:"triangle-list"},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x3",data:n.position},aTextureCoord:{format:"float32x2",data:n.textureCoord}},indices:n.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36},bindingResources:{uSampler:a}},t={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[.5,.5,.5,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[o]},{__type__:"CopyTextureToTexture",source:{texture:null},destination:{texture:a.texture},copySize:[e.width,e.height]}]}]};let u=0;function l(){let s=Date.now();s*=.001;const v=s-u;u=s;const{projectionMatrix:g,modelViewMatrix:h}=y(e,v);p(o.bindingResources).uProjectionMatrix={value:g},p(o.bindingResources).uModelViewMatrix={value:h},c.submit(t),requestAnimationFrame(l)}requestAnimationFrame(l)}function b(){const e=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],i=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(e),textureCoord:new Float32Array(i),indices:new Uint16Array(r)}}function y(e,i){const r=45*Math.PI/180,c=e.clientWidth/e.clientHeight,n=.1,a=100,o=x();w(o,r,c,n,a);const t=x();return C(t,t,[-0,0,-6]),m(t,t,d,[0,0,1]),m(t,t,d*.7,[0,1,0]),d+=i,{projectionMatrix:o,modelViewMatrix:t}}
//# sourceMappingURL=fractalCube.html-D5UL05a2.js.map
