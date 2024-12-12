// see https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample1/webgl-demo.js
// https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/

import { ISubmit } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";

async function main()
{
    const renderingContext: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl" };

    const webgl = new WebGL(renderingContext);
    // const webgl = await new WebGPU().init();

    const submit: ISubmit = {
        commandEncoders: [{
            passEncoders: [
                {
                    descriptor: {
                        colorAttachments: [{
                            // view: { texture: {} },
                            clearValue: [1, 0, 0, 0.5],
                            loadOp: "clear",
                        }],
                    },
                }
            ]
        }]
    };

    webgl.submit(submit);
}

window.onload = main;
