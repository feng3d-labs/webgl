import"../../modulepreload-polyfill-B5Qt9EMX.js";import{W as p,r}from"../../WebGL-lLSa4FVc.js";import{p as m,c as h}from"../../bunny-BYASNJvz.js";import{i as u,l as v,p as w}from"../../gl-mat4-DzNqOpLa.js";const e=document.createElement("canvas");e.id="glcanvas";e.width=window.innerWidth;e.height=window.innerHeight;document.body.appendChild(e);const g=new p({canvasId:"glcanvas",webGLContextAttributes:{antialias:!0}}),b=m.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]),a=h.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]);let s=0,c=e.clientWidth,d=e.clientHeight;const o={vertices:{position:{data:new Float32Array(b),format:"float32x3"}},indices:new Uint16Array(a),draw:{__type__:"DrawIndexed",indexCount:a.length},bindingResources:{model:{value:u([])}},pipeline:{vertex:{code:`precision mediump float;
        attribute vec3 position;
        uniform mat4 model, view, projection;
        void main() {
          gl_Position = projection * view * model * vec4(position, 1);
        }`},fragment:{code:`precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 1, 1, 1);
        }`,targets:[{blend:{}}]},depthStencil:{}}},f={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}],depthStencilAttachment:{depthClearValue:1}},renderPassObjects:[o]}]}]};function l(){c=e.width=e.clientWidth,d=e.height=e.clientHeight,s++;const t=.01*s;r(o.bindingResources).view={value:v([],[30*Math.cos(t),2.5,30*Math.sin(t)],[0,2.5,0],[0,1,0])},r(o.bindingResources).projection={value:w([],Math.PI/4,c/d,.01,1e3)},g.submit(f),requestAnimationFrame(l)}l();
//# sourceMappingURL=bunny.html-NHqG0-ul.js.map
