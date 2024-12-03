// see https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample1/webgl-demo.js
// https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/

import { WebGL } from "@feng3d/webgl";

function main()
{
    const webgl = new WebGL({ canvasId: "glcanvas", contextId: "webgl" });

    webgl.submit({
        commandEncoders: [{
            passEncoders: [
                {
                    descriptor: {
                        colorAttachments: [{
                            clearValue: [1, 0, 0, 0.5],
                            loadOp: "clear",
                        }],
                    },
                }
            ]
        }]
    });
}

window.onload = main;
