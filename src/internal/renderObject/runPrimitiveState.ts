import { CullFace, FrontFace, PrimitiveState } from '@feng3d/render-api';

const cullFaceMap = Object.freeze({
    FRONT_AND_BACK: 'FRONT_AND_BACK',
    none: 'BACK', // 不会开启剔除面功能，什么值无所谓。
    front: 'FRONT',
    back: 'BACK',
});

const frontFaceMap = Object.freeze({ ccw: 'CCW', cw: 'CW' });

export function runPrimitiveState(gl: WebGLRenderingContext, primitive?: PrimitiveState)
{
    const cullFace: CullFace = primitive?.cullFace || 'none';
    const frontFace: FrontFace = primitive?.frontFace || 'ccw';

    if (cullFace !== 'none')
    {
        const glCullMode = cullFaceMap[cullFace];
        console.assert(!!glCullMode, `接收到错误值，请从 ${Object.keys(cullFaceMap).toString()} 中取值！`);

        const glFrontFace = frontFaceMap[frontFace];
        console.assert(!!glFrontFace, `接收到错误 IFrontFace 值，请从 ${Object.keys(frontFaceMap).toString()} 中取值！`);

        //
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[glCullMode]);
        gl.frontFace(gl[glFrontFace]);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }
}

