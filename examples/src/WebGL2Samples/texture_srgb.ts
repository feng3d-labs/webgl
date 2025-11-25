import { Buffer, CanvasContext, RenderPass, RenderPassObject, RenderPipeline, Sampler, Texture, VertexAttributes, VertexData } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';

import { getShaderSource, loadImage } from './utility';

(function ()
{
    const canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2', webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc, {
        clearColorValue: [0.0, 0.0, 0.0, 1.0],
        loadColorOp: 'clear',
    });

    // -- Initialize program

    const program: RenderPipeline = {
        vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs') },
    };

    // -- Initialize buffer

    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0,
    ]);
    const vertexPosBuffer: VertexData = positions;

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
    ]);
    const vertexTexBuffer: VertexData = texcoords;

    // -- Initialize vertex array

    const vertices: VertexAttributes = {
        position: { data: vertexPosBuffer, format: 'float32x2' },
        textureCoordinates: { data: vertexTexBuffer, format: 'float32x2' },
    };

    // -- Load texture then render

    const imageUrl = '../../assets/img/Di-3d.png';
    let texture: Texture;
    let sampler: Sampler;
    loadImage(imageUrl, function (image)
    {
        texture = {
            descriptor: {
                size: [image.width, image.height],
                format: 'rgba8unorm-srgb',
            },
            sources: [{ mipLevel: 0, image }],
        };
        sampler = { minFilter: 'nearest', magFilter: 'nearest' };

        render();
    });

    function render()
    {
        const renderObjects: RenderPassObject[] = [];
        // Clear color buffer
        const rp: RenderPass = {
            renderPassObjects: renderObjects,
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);
        renderObjects.push({
            pipeline: program,
            bindingResources: {
                mvp: { value: matrix },
                materialDiffuse: { texture, sampler },
            },
            vertices,
            draw: { __type__: 'DrawVertex', vertexCount: 6 },
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Cleanup
        webgl.deleteBuffer(Buffer.getBuffer(vertexPosBuffer.buffer));
        webgl.deleteBuffer(Buffer.getBuffer(vertexTexBuffer.buffer));
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    }
})();
