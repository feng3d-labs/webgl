import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as r}from"../../WebGL-b4686ab5.js";const c=async t=>{const o=window.devicePixelRatio||1;t.width=t.clientWidth*o,t.height=t.clientHeight*o;const i=new r({canvasId:"glcanvas",webGLcontextId:"webgl"}),n={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderObjects:[{pipeline:{vertex:{code:`
                                    attribute vec4 position;

                                    void main() {
                                        gl_Position = position;
                                    }
                                    `},fragment:{code:`
                                    precision highp float;
                                    uniform vec4 color;
                                    void main() {
                                        gl_FragColor = color;
                                        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                                    }
                                    `}},geometry:{vertices:{position:{data:new Float32Array([0,.5,-.5,-.5,.5,-.5]),format:"float32x2"}},indices:new Uint16Array([0,1,2]),draw:{__type__:"DrawIndexed",indexCount:3}},bindingResources:{color:[1,0,0,1]}}]}]}]};i.submit(n)};let e=document.querySelector("#glcanvas");e||(e=document.createElement("canvas"),e.id="webgpu",e.style.width="400px",e.style.height="300px",document.body.appendChild(e));c(e);
//# sourceMappingURL=sample1.html-96515621.js.map
