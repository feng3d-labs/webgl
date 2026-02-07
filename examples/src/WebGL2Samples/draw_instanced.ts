import { CanvasContext, RenderObject, RenderPipeline, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { getShaderSource } from './utility';

const canvas = document.createElement('canvas');

canvas.id = 'glcanvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderingContext: CanvasContext = { canvasId: 'glcanvas' };
const webgl = new WebGL(renderingContext);

const vertexPosBuffer = new Float32Array([-0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5]);
const vertexColorBuffer = new Float32Array([
    1.0, 0.5, 0.0,
    0.0, 0.5, 1.0]);

const program: RenderPipeline = {
    vertex: { code: getShaderSource('vs') },
    fragment: { code: getShaderSource('fs'), targets: [{ blend: {} }] },
    primitive: { topology: 'triangle-list' },
};

const vertexArray: { vertices?: VertexAttributes } = {
    vertices: {
        pos: { data: vertexPosBuffer, format: 'float32x2' },
        color: { data: vertexColorBuffer, format: 'float32x3', stepMode: 'instance' },
    },
};

const renderObject: RenderObject = {
    bindingResources: {},
    vertices: vertexArray.vertices,
    draw: { __type__: 'DrawVertex', vertexCount: 3, instanceCount: 2 },
    pipeline: program,
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

webgl.submit({
    commandEncoders: [{
        passEncoders: [
            {
                descriptor: {
                    colorAttachments: [{
                        clearValue: [0.0, 0.0, 0.0, 1.0],
                        loadOp: 'clear',
                    }],
                },
                renderPassObjects: [renderObject],
            },
        ],
    }],
});

// -- Delete WebGL resources
webgl.deleteProgram(program);
