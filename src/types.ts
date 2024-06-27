/**
 * 构造函数
 *
 * @example
 * ```
 * const Vector2Constructor: Constructor<Vector2> = Vector2;
 * ```
 */
export type Constructor<T = any> = (new (...args: any[]) => T);

/**
 * 映射每个属性的类定义
 *
 * @example
 * ```
 * const classmap: ConstructorOf<{ Vector2: Vector2 }> = { Vector2: Vector2 };
 * ```
 */
export type ConstructorOf<T> = { [P in keyof T]: Constructor<T[P]>; };

/**
 * 让T中以及所有键值中的所有键都是可选的
 */
export type gPartial<T> = {
    [P in keyof T]?: T[P] | gPartial<T[P]>;
};

export type Lazy<T> = T | ((...args: any[]) => T);

export type LazyObject<T> = { [P in keyof T]: Lazy<T[P]>; };

export const lazy = {
    getValue<T>(lazyItem: Lazy<T>, ...args: any[]): T
    {
        if (typeof lazyItem === "function")
        {
            // eslint-disable-next-line prefer-spread
            return (lazyItem as Function).apply(undefined, args);
        }

        return lazyItem;
    }
};
