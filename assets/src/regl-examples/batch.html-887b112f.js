import"../../modulepreload-polyfill-3cfb730f.js";import{r as c}from"../../index-ac627bb5.js";import{W as f}from"../../WebGL-b4686ab5.js";const t=document.createElement("canvas");t.id="glcanvas";t.width=window.innerWidth;t.height=window.innerHeight;document.body.appendChild(t);const d=new f({canvasId:"glcanvas"});let o=0,n=0;const s=[{offset:[-1,-1]},{offset:[-1,0]},{offset:[-1,1]},{offset:[0,-1]},{offset:[0,0]},{offset:[0,1]},{offset:[1,-1]},{offset:[1,0]},{offset:[1,1]}],l={vertex:{code:`precision mediump float;
    attribute vec2 position;
    uniform float angle;
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(
        cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    }`},fragment:{code:`precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`},depthStencil:{depthWriteEnabled:!1}},m={vertices:{position:{data:new Float32Array([.5,0,0,.5,1,1]),format:"float32x2"}}};function g(e){return{vertices:m.vertices,draw:{__type__:"DrawVertex",vertexCount:3},bindingResources:{offset:s[e].offset},pipeline:l}}const r=[];for(let e=0;e<s.length;e++)r.push(g(e));const h={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderPassObjects:r}]}]};function a(){t.width=t.clientWidth,t.height=t.clientHeight,n++;for(let e=0;e<s.length;e++){o=e;const i=r[e];c(i.bindingResources).color=[Math.sin(.02*((.1+Math.sin(o))*n+3*o)),Math.cos(.02*(.02*n+.1*o)),Math.sin(.02*((.3+Math.cos(2*o))*n+.8*o)),1],c(i.bindingResources).angle=.01*n}d.submit(h),requestAnimationFrame(a)}a();
//# sourceMappingURL=batch.html-887b112f.js.map
