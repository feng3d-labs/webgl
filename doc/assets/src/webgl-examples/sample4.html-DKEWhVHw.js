import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css                  */import{W as u,r as s}from"../../WebGL-lLSa4FVc.js";import{c as l,p as v,t as x,g}from"../../mat4-BHCnbM9z.js";import"../../common-C8IKy_GC.js";let d=0;V();function V(){const o=document.querySelector("#glcanvas"),n=new u({canvasId:"glcanvas",webGLcontextId:"webgl"}),r={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying lowp vec4 vColor;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }
      `},fragment:{code:`
        varying lowp vec4 vColor;
    
        void main(void) {
          gl_FragColor = vColor;
        }
      `},depthStencil:{depthCompare:"less-equal"},primitive:{topology:"triangle-strip"}},vertices:{aVertexPosition:{format:"float32x2",data:new Float32Array([1,1,-1,1,1,-1,-1,-1])},aVertexColor:{format:"float32x4",data:new Float32Array([1,1,1,1,1,0,0,1,0,1,0,1,0,0,1,1])}},draw:{__type__:"DrawVertex",firstVertex:0,vertexCount:4},bindingResources:{}},c={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[r]};let a=0;function i(t){t*=.001;const e=t-a;a=t;const{projectionMatrix:m,modelViewMatrix:p}=f(o,e);s(r.bindingResources).uProjectionMatrix={value:m},s(r.bindingResources).uModelViewMatrix={value:p},n.submit({commandEncoders:[{passEncoders:[c]}]}),requestAnimationFrame(i)}requestAnimationFrame(i)}function f(o,n){const r=45*Math.PI/180,c=o.clientWidth/o.clientHeight,a=.1,i=100,t=l();v(t,r,c,a,i);const e=l();return x(e,e,[-0,0,-6]),g(e,e,d,[0,0,1]),d+=n,{projectionMatrix:t,modelViewMatrix:e}}
//# sourceMappingURL=sample4.html-DKEWhVHw.js.map
