import { RenderParams } from "../data/RenderParams";
import { defaultRenderParams } from "../defaults/defaultRenderParams";

export function getRenderParams(key: RenderParams)
{
    let value = canvasContextMap.get(key);
    // if (!value)
    // {
        value = Object.assign({}, defaultRenderParams, key);

    //     canvasContextMap.set(key, value);
    // }

    return value;
}

const canvasContextMap = new Map<RenderParams, RenderParams>();
