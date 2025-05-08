import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as p}from"../../WebGL-b4686ab5.js";import{c as s,p as u,t as x,g as v}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let l=0;g();function g(){const r=document.querySelector("#glcanvas"),n=new p({canvasId:"glcanvas",webGLcontextId:"webgl"}),o={pipeline:{vertex:{code:`
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
      `},depthStencil:{depthCompare:"less-equal"}},geometry:{primitive:{topology:"triangle-strip"},vertices:{aVertexPosition:{format:"float32x2",data:new Float32Array([1,1,-1,1,1,-1,-1,-1])},aVertexColor:{format:"float32x4",data:new Float32Array([1,1,1,1,1,0,0,1,0,1,0,1,0,0,1,1])}},draw:{__type__:"DrawVertex",firstVertex:0,vertexCount:4}},bindingResources:{}},c={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderObjects:[o]};let a=0;function i(t){t*=.001;const e=t-a;a=t;const{projectionMatrix:d,modelViewMatrix:m}=V(r,e);o.bindingResources.uProjectionMatrix=d,o.bindingResources.uModelViewMatrix=m,n.submit({commandEncoders:[{passEncoders:[c]}]}),requestAnimationFrame(i)}requestAnimationFrame(i)}function V(r,n){const o=45*Math.PI/180,c=r.clientWidth/r.clientHeight,a=.1,i=100,t=s();u(t,o,c,a,i);const e=s();return x(e,e,[-0,0,-6]),v(e,e,l,[0,0,1]),l+=n,{projectionMatrix:t,modelViewMatrix:e}}
//# sourceMappingURL=sample4.html-358d920f.js.map
