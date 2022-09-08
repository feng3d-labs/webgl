import { Texture } from '../data/Texture';

/**
 * WebGL属性，用于缓存属性状态
 */
export class WebGLProperties
{
    private properties = new WeakMap<Texture, { __currentAnisotropy: number }>();

    get(object: Texture)
    {
        const { properties } = this;

        let map = properties.get(object);

        if (map === undefined)
        {
            map = {} as any;
            properties.set(object, map);
        }

        return map;
    }

    remove(object: Texture)
    {
        this.properties.delete(object);
    }

    update(object: Texture, key: string, value: any)
    {
        this.properties.get(object)[key] = value;
    }

    dispose()
    {
        this.properties = new WeakMap();
    }
}
