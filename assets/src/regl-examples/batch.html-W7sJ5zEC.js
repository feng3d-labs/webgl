import"../../modulepreload-polyfill-B5Qt9EMX.js";import{W as f,r as a}from"../../WebGL-lLSa4FVc.js";const t=document.createElement("canvas");t.id="glcanvas";t.width=window.innerWidth;t.height=window.innerHeight;document.body.appendChild(t);const l=new f({canvasId:"glcanvas"});let o=0,n=0;const s=[{offset:[-1,-1]},{offset:[-1,0]},{offset:[-1,1]},{offset:[0,-1]},{offset:[0,0]},{offset:[0,1]},{offset:[1,-1]},{offset:[1,0]},{offset:[1,1]}],d={vertex:{code:`precision mediump float;
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
    }`},depthStencil:{depthWriteEnabled:!1}},m={vertices:{position:{data:new Float32Array([.5,0,0,.5,1,1]),format:"float32x2"}}};function g(e){return{vertices:m.vertices,draw:{__type__:"DrawVertex",vertexCount:3},bindingResources:{offset:{value:s[e].offset}},pipeline:d}}const r=[];for(let e=0;e<s.length;e++)r.push(g(e));const h={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderPassObjects:r}]}]};function c(){t.width=t.clientWidth,t.height=t.clientHeight,n++;for(let e=0;e<s.length;e++){o=e;const i=r[e];a(i.bindingResources).color={value:[Math.sin(.02*((.1+Math.sin(o))*n+3*o)),Math.cos(.02*(.02*n+.1*o)),Math.sin(.02*((.3+Math.cos(2*o))*n+.8*o)),1]},a(i.bindingResources).angle={value:.01*n}}l.submit(h),requestAnimationFrame(c)}c();
//# sourceMappingURL=batch.html-W7sJ5zEC.js.map
