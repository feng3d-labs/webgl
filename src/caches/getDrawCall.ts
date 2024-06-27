import { DrawCall } from "../data/DrawCall";
import { defaultDrawCall } from "../defaults/defaultDrawCall";

export function getDrawCall(key: DrawCall)
{
    let value = canvasContextMap.get(key);
    if (!value)
    {
        value = Object.assign({}, defaultDrawCall, key);

        canvasContextMap.set(key, value);
    }

    return value;
}

const canvasContextMap = new Map<DrawCall, DrawCall>();
