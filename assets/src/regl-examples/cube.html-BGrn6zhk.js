import"../../modulepreload-polyfill-B5Qt9EMX.js";import{W as x,r as s}from"../../WebGL-lLSa4FVc.js";import{l as y,p as E}from"../../gl-mat4-DzNqOpLa.js";(async()=>{const t=document.createElement("canvas");t.id="glcanvas",t.width=window.innerWidth,t.height=window.innerHeight,document.body.appendChild(t);const p=new x({canvasId:"glcanvas"}),v=[[-.5,.5,.5],[.5,.5,.5],[.5,-.5,.5],[-.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,-.5],[.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5],[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],m=[[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1]],h=[[2,1,0],[2,0,3],[6,5,4],[6,4,7],[10,9,8],[10,8,11],[14,13,12],[14,12,15],[18,17,16],[18,16,19],[20,21,22],[23,20,22]],g=v.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]),w=m.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]),a=h.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]);let c=0,d=1,u=1;const r={vertices:{position:{data:new Float32Array(g),format:"float32x3"},uv:{data:new Float32Array(w),format:"float32x2"}},indices:new Uint16Array(a),draw:{__type__:"DrawIndexed",indexCount:a.length},bindingResources:{},pipeline:{vertex:{code:`precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUv;
        uniform mat4 projection, view;
        void main() {
          vUv = uv;
          gl_Position = projection * view * vec4(position, 1);
        }`},fragment:{code:`precision mediump float;
        varying vec2 vUv;
        uniform sampler2D tex;
        void main () {
          gl_FragColor = texture2D(tex,vUv);
        }`,targets:[{blend:{}}]},depthStencil:{depthWriteEnabled:!0}}},b={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderPassObjects:[r]}]}]};function l(){c++,d=t.width=t.clientWidth,u=t.height=t.clientHeight;const e=.01*c;s(r.bindingResources).view={value:y([],[5*Math.cos(e),2.5*Math.sin(e),5*Math.sin(e)],[0,0,0],[0,1,0])},s(r.bindingResources).projection={value:E([],Math.PI/4,d/u,.01,1e3)},p.submit(b),requestAnimationFrame(l)}const i=new Image;i.src="../../assets/peppers.png",await i.decode();const f={texture:{descriptor:{size:[i.width,i.height]},sources:[{image:i}]},sampler:{minFilter:"linear"}};s(r.bindingResources).tex=f,l()})();
//# sourceMappingURL=cube.html-BGrn6zhk.js.map
