export const generateUuid = (): string => {
    return performance.now().toString(36).replace(".", "") + Math.random().toString(36).slice(-4);
}
