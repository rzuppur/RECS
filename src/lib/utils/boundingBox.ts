export function pointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxW: number, boxH: number): boolean {
    return boxX <= pointX && boxY <= pointY && boxX + boxW > pointX && boxY + boxH > pointY;
}

export function boxInBox(box1x: number, box1y: number, box1w: number, box1h: number, box2x: number, box2y: number, box2w: number, box2h: number): boolean {
    return box1x < (box2x + box2w)
        && box2x < (box1x + box1w)
        && box1y < (box2y + box2h)
        && box2y < (box1y + box1h);
}
