export function flattenMessages(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenMessages(obj[key] as Record<string, unknown>, fullKey));
        } else {
            result[fullKey] = String(obj[key]);
        }
    }
    return result;
}
