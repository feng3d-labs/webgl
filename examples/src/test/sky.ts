import { effect, reactive } from '@feng3d/reactivity';
import { CanvasContext, RenderObject, Submit } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { GUI } from 'dat.gui';
import { mat4 } from 'gl-matrix';

import sky_frag from './sky_frag.glsl';
import sky_vert from './sky_vert.glsl';

const parameters: {
    readonly elevation: number,
    readonly azimuth: number,
    readonly cameraRotationX: number,
    readonly cameraRotationY: number,
} = {
    elevation: 2,
    azimuth: 180,
    cameraRotationX: 0,
    cameraRotationY: 0,
};

const r_parameters = reactive(parameters);

main();

//
// Start here
//
async function main()
{
    const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;

    const gui: GUI = new GUI();

    const renderingContext: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2' };

    const webgl = new WebGL(renderingContext);

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers();

    const renderObject: RenderObject = {
        pipeline: {
            vertex: {
                code: sky_vert,
            }, fragment: {
                code: sky_frag,
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: { depthCompare: 'less-equal' },
        },
        vertices: {
            position: {
                format: 'float32x3',
                data: buffers.position,
            },
        },
        indices: buffers.indices,
        draw: { __type__: 'DrawIndexed', firstIndex: 0, indexCount: 36 },
        bindingResources: {
            modelMatrix: [10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 1],
            modelViewMatrix: [-3853.8425, -4464.3149, 8075.7534, 0, 0.0000, 8751.7734, 4838.0225, 0, -9227.5615, 1864.4976, -3372.7957, 0, -0.0000, -0.4583, -2.5568, 1],
            projectionMatrix: [1.2071, 0, 0, 0, 0, 2.4142, 0, 0, 0, 0, -1.0002, -1, 0, 0, -0.2000, 0],
            cameraPosition: [1.8602, 1.6380, -0.7769],
            sunPosition: [0.0000, 0.0349, -0.9994],
            rayleigh: 2,
            turbidity: 10,
            mieCoefficient: 0.0050,
            up: [0, 1, 0],
            mieDirectionalG: 0.2,
        },
    };

    const folderSky = gui.addFolder('Sky');
    folderSky.add(r_parameters, 'elevation', 0, 90, 0.1);
    folderSky.add(r_parameters, 'azimuth', -180, 180, 0.1);
    folderSky.add(r_parameters, 'cameraRotationX', -180, 180, 0.1);
    folderSky.add(r_parameters, 'cameraRotationY', -180, 180, 0.1);
    folderSky.open();

    effect(() =>
    {
        const phi = (90 - r_parameters.elevation) / 180 * Math.PI;
        const theta = (r_parameters.azimuth) / 180 * Math.PI;

        const sun = setFromSphericalCoords(1, phi, theta);
        reactive(renderObject.bindingResources).sunPosition = sun;
    });

    effect(() =>
    {
        const cameraRotationX = r_parameters.cameraRotationX / 180 * Math.PI;
        const cameraRotationY = r_parameters.cameraRotationY / 180 * Math.PI;

        //
        const fieldOfView = 45 * Math.PI / 180; // in radians
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        const modelMatrix = mat4.fromValues(10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 1);

        const cameraMatrix = mat4.create();
        mat4.rotateX(cameraMatrix, cameraMatrix, cameraRotationX);
        mat4.rotateY(cameraMatrix, cameraMatrix, cameraRotationY);
        const viewMatrix = mat4.create();
        mat4.invert(viewMatrix, cameraMatrix);

        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        reactive(renderObject.bindingResources).modelMatrix = modelMatrix as Float32Array;
        reactive(renderObject.bindingResources).modelViewMatrix = modelViewMatrix as Float32Array;
        reactive(renderObject.bindingResources).projectionMatrix = projectionMatrix as Float32Array;
        reactive(renderObject.bindingResources).cameraPosition = [0, 0, 0];
    });

    const submit: Submit = {
        commandEncoders: [{
            passEncoders: [
                // 绘制
                {
                    descriptor: {
                        colorAttachments: [{ clearValue: [0.5, 0.5, 0.5, 1.0], loadOp: 'clear' }],
                        depthStencilAttachment: { depthClearValue: 1.0, depthLoadOp: 'clear' },
                    },
                    renderPassObjects: [renderObject],
                },
            ],
        }],
    };

    // Draw the scene repeatedly
    function render()
    {
        webgl.submit(submit);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers()
{
    // Now create an array of positions for the cube.

    const positions = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ];

    return {
        position: new Float32Array(positions),
        indices: new Uint16Array(indices),
    };
}

function setFromSphericalCoords(radius, phi, theta)
{
    const sinPhiRadius = Math.sin(phi) * radius;

    const x = sinPhiRadius * Math.sin(theta);
    const y = Math.cos(phi) * radius;
    const z = sinPhiRadius * Math.cos(theta);

    return [x, y, z];
}