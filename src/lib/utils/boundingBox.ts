export function pointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxW: number, boxH: number): boolean {
    return boxX <= pointX && boxY <= pointY && boxX + boxW > pointX && boxY + boxH > pointY;
}
