import { DrawCall } from "../data/DrawCall";
import { defaultDrawCall } from "../defaults/defaultDrawCall";

export function getDrawCall(key: DrawCall)
{
    // let value = canvasContextMap.get(key);
    // if (!value)
    // {
    key = Object.assign({}, defaultDrawCall, key);

    //     canvasContextMap.set(key, value);
    // }

    return key;
}

const canvasContextMap = new Map<DrawCall, DrawCall>();
