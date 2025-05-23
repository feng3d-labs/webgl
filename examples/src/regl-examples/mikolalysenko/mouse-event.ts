// @see https://github.com/mikolalysenko/mouse-event.git

function mouseButtons(ev)
{
    if (typeof ev === "object")
    {
        if ("buttons" in ev)
        {
            return ev.buttons;
        }
        else if ("which" in ev)
        {
            const b = ev.which;
            if (b === 2)
            {
                return 4;
            }
            else if (b === 3)
            {
                return 2;
            }
            else if (b > 0)
            {
                return 1 << (b - 1);
            }
        }
        else if ("button" in ev)
        {
            const b = ev.button;
            if (b === 1)
            {
                return 4;
            }
            else if (b === 2)
            {
                return 2;
            }
            else if (b >= 0)
            {
                return 1 << b;
            }
        }
    }

    return 0;
}
export const buttons = mouseButtons;

function mouseElement(ev)
{
    return ev.target || ev.srcElement || window;
}
export const element = mouseElement;

function mouseRelativeX(ev)
{
    if (typeof ev === "object")
    {
        if ("offsetX" in ev)
        {
            return ev.offsetX;
        }
        const target = mouseElement(ev);
        const bounds = target.getBoundingClientRect();

        return ev.clientX - bounds.left;
    }

    return 0;
}
export const x = mouseRelativeX;

function mouseRelativeY(ev)
{
    if (typeof ev === "object")
    {
        if ("offsetY" in ev)
        {
            return ev.offsetY;
        }
        const target = mouseElement(ev);
        const bounds = target.getBoundingClientRect();

        return ev.clientY - bounds.top;
    }

    return 0;
}
export const y = mouseRelativeY;
