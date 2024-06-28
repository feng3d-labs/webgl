import { $set } from "@feng3d/serialization";
import { IRenderObject, Texture2D, WebGL } from "../../../src";

(function ()
{
    const div = document.createElement("div");
    div.innerHTML = `<div id="info">WebGL 2 Samples - draw_image_space</div>`;
    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.body.innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    loadImage("../../resources/assets/img/Di-3d.png", (img) =>
    {
        const diffuse = $set(new Texture2D(), {
            minFilter: "LINEAR",
            source: img as any,
        });

        const renderAtomic: IRenderObject = {
            attributes: {},
            uniforms: {
                diffuse,
                // eslint-disable-next-line camelcase
                u_imageSize: [canvas.width / 2, canvas.height / 2],
            },
            renderParams: { enableBlend: true },
            pipeline: {
                primitive: { topology: "TRIANGLES", cullMode: "NONE" },
                vertex:
                    `#version 300 es
    precision highp float;
    precision highp int;
    
    void main()
    {
        gl_Position = vec4(2.f * float(uint(gl_VertexID) % 2u) - 1.f, 2.f * float(uint(gl_VertexID) / 2u) - 1.f, 0.0, 1.0);
    }`,
                fragment: `#version 300 es
    precision highp float;
    precision highp int;
    
    uniform sampler2D diffuse;
    
    uniform vec2 u_imageSize;
    
    out vec4 color;
    
    void main()
    {
        color = texture(diffuse, vec2(gl_FragCoord.x, u_imageSize.y - gl_FragCoord.y) / u_imageSize);
    }` }
        };

        function draw()
        {
            canvas.width = Math.min(window.innerWidth, window.innerHeight);
            canvas.height = canvas.width;

            //
            renderAtomic.uniforms["u_imageSize"] = [canvas.width / 2, canvas.height / 2];

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
    });

    function loadImage(url: string, onload: (img: HTMLImageElement) => void)
    {
        const img = new Image();
        img.src = url;
        img.onload = function ()
        {
            onload(img);
        };

        return img;
    }
})();
