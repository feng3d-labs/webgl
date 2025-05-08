import"../../modulepreload-polyfill-3cfb730f.js";import{W as l}from"../../WebGL-b4686ab5.js";const a=async o=>{const t=window.devicePixelRatio||1;o.width=o.clientWidth*t,o.height=o.clientHeight*t;const c=new l({canvasId:"glcanvas",webGLcontextId:"webgl"}),i={pipeline:{vertex:{code:`
                attribute vec4 position;

                void main() {
                    gl_Position = position;
                }
                `},fragment:{code:`
                precision highp float;
                uniform vec4 color;
                void main() {
                    gl_FragColor = color;
                }
                `}},geometry:{vertices:{position:{data:new Float32Array([0,.5,-.5,-.5,.5,-.5]),format:"float32x2"}},indices:new Uint16Array([0,1,2]),draw:{__type__:"DrawIndexed",indexCount:3}},bindingResources:{color:[1,0,0,1]}},r={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderObjects:[i]}]}]};function n(){c.submit(r),requestAnimationFrame(n)}n(),window.onclick=()=>{i.pipeline.vertex.code=`
                attribute vec4 position;

                void main() {
                    vec4 pos = position;
                pos.x = pos.x + 0.5;
                    gl_Position = pos;
                }
                `,i.pipeline.fragment.code=`
                precision highp float;
                uniform vec4 color;
                void main() {
                    vec4 col = color;
                    col.x = 0.5;
                    col.y = 0.6;
                    col.z = 0.7;
                    gl_FragColor = col;
                }
                `}};let e=document.querySelector("#glcanvas");e||(e=document.createElement("canvas"),e.id="webgpu",e.style.width="400px",e.style.height="300px",document.body.appendChild(e));a(e);
//# sourceMappingURL=RenderObjectChanges.html-439071e8.js.map
