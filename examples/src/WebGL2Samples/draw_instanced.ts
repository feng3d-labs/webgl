import { IRenderObject, WebGL } from "../../../src";

(function ()
{
    const div = document.createElement("div");
    div.innerHTML = `    <div id="info">WebGL 2 Samples - draw_instanced</div>
    <p id="description">
        This samples demonstrates the use of gl.DrawArraysInstanced()
    </p>`;
    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.body.innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    const renderAtomic: IRenderObject = {
        attributes: {
            pos: {
                array: [-0.3, -0.5,
                    0.3, -0.5,
                    0.0, 0.5], itemSize: 2
            },
            color: {
                array: [
                    1.0, 0.5, 0.0,
                    0.0, 0.5, 1.0], itemSize: 3, divisor: 1
            },
        },
        uniforms: {},
        drawVertex: { instanceCount: 2 },
        renderParams: { enableBlend: true },
        pipeline: {
            primitive: { topology: "TRIANGLES", cullMode: "NONE" },
            vertex:
                `#version 300 es
                    #define POSITION_LOCATION 0
                    #define COLOR_LOCATION 1
                    
                    precision highp float;
                    precision highp int;
            
                    layout(location = POSITION_LOCATION) in vec2 pos;
                    layout(location = COLOR_LOCATION) in vec4 color;
                    flat out vec4 v_color;
            
                    void main()
                    {
                        v_color = color;
                        gl_Position = vec4(pos + vec2(float(gl_InstanceID) - 0.5, 0.0), 0.0, 1.0);
                    }`,
            fragment: `#version 300 es
                precision highp float;
                precision highp int;
        
                flat in vec4 v_color;
                out vec4 color;
        
                void main()
                {
                    color = v_color;
                }` }
    };

    function draw()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        WebGL.submit({
            canvasContext: { canvasId: "glcanvas" },
            renderPasss: [{
                passDescriptor: {
                    colorAttachments: [{
                        clearValue: [0.0, 0.0, 0.0, 1.0],
                        loadOp: "clear",
                    }],
                },
                renderObjects: [renderAtomic]
            }]
        });

        requestAnimationFrame(draw);
    }
    draw();
})();
