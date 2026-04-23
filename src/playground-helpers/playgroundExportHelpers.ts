import { gzip, ungzip } from 'pako';

interface Identifier {
    type: string,
    id: string,
}

export interface PlaygroundDataV1 {
    policy: string;
    schema: string;
    principal: Identifier;
    action: Identifier;
    resource: Identifier;
    entities: string;
    context: string;
    isAVPFormat: boolean;
    sampleApp?: string;
    sampleQueryIndex?: number;
}

export type CedarPlaygroundDataTransferObject = {
    interfaceVersion: 1;
    cedarVersion: string;
    playgroundData: PlaygroundDataV1;
}

type PlaygroundExportResult = {
    result: string;
} | {
    error: string;
};

type PlaygroundImportResult = {
    result: CedarPlaygroundDataTransferObject;
} | {
    error: string;
};

/**
 * The string that will be prefixed to the state string when it goes into the URL
 * eg. https://www.cedarpolicy.com/en/playground#data:HAsjFhl...
 **/
export const PLAYGROUND_URL_FRAG_PREFIX = 'data:';

/** Stringify/minimy state, convert to Uint8Array, compress with gzip, convert to base64 and return. */
export function exportCedarPlaygroundDataToBase64(dataTransferObject: CedarPlaygroundDataTransferObject): PlaygroundExportResult {
    try {
        const minifiedState: CedarPlaygroundDataTransferObject = {
            ...dataTransferObject,
            playgroundData: {
                ...dataTransferObject.playgroundData,
                schema: minifyJson(dataTransferObject.playgroundData.schema),
                context: minifyJson(dataTransferObject.playgroundData.context),
                entities: minifyJson(dataTransferObject.playgroundData.entities),
            },
        };
        const enc = new TextEncoder();
        const uncompressedUint8Array = enc.encode(JSON.stringify(minifiedState));
        const compressedUint8Array = gzip(uncompressedUint8Array);
        return { result: uint8ArrayToBase64(compressedUint8Array) };
    } catch (e) {
        return { error: `${e}` };
    }
}

/** Convert base64 string to Uint8Array, decompress with gzip, convert to UTF-8, parse JSON and check fields are valid, then returns state object. */
export function importCedarPlaygroundDataFromBase64(base64: string): PlaygroundImportResult {
    try {
        const compressedUint8Array = base64ToUint8Array(base64);
        const decompressedUint8Array = ungzip(compressedUint8Array);
        const dec = new TextDecoder();
        const playgroundState = JSON.parse(dec.decode(decompressedUint8Array)) as CedarPlaygroundDataTransferObject;
        validateCedarPlaygroundDTO(playgroundState);
        switch(playgroundState.interfaceVersion){
        case 1: {
            // Set each field of returned data directly instead of using spread operator, as user-supplied state string could contain extra attributes
            const formattedState: CedarPlaygroundDataTransferObject = {
                interfaceVersion: 1,
                cedarVersion: playgroundState.cedarVersion,
                playgroundData: {
                    principal: playgroundState.playgroundData.principal,
                    action: playgroundState.playgroundData.action,
                    resource: playgroundState.playgroundData.resource,
                    isAVPFormat: playgroundState.playgroundData.isAVPFormat,
                    policy: playgroundState.playgroundData.policy,
                    sampleApp: playgroundState.playgroundData.sampleApp,
                    sampleQueryIndex: playgroundState.playgroundData.sampleQueryIndex,
                    schema: formatJson(playgroundState.playgroundData.schema),
                    context: formatJson(playgroundState.playgroundData.context, 2),
                    entities: formatJson(playgroundState.playgroundData.entities),
                },
            };
            return { result: formattedState };
        }
        default: {
            throw new TypeError('Encountered invalid interface version when importing playground data from base64 string!');
        }
        }
    } catch (e) {
        return { error: `${e}` };
    }
}

/** Check imported JSON for correct data structure. Error if anything is wrong, do nothing if valid*/
function validateCedarPlaygroundDTO(dataTransferObject: CedarPlaygroundDataTransferObject) {
    if (typeof dataTransferObject.cedarVersion !== 'string') {
        throw new TypeError(`Expected 'cedarVersion' to be of type 'string', got: '${typeof dataTransferObject.cedarVersion}'`);
    }
    if (typeof dataTransferObject.interfaceVersion !== 'number') {
        throw new TypeError(`Expected 'interfaceVersion' to be of type 'number', got: '${typeof dataTransferObject.interfaceVersion}'`);
    }

    switch (dataTransferObject.interfaceVersion) {
    case 1: {
        if (typeof dataTransferObject.playgroundData !== 'object') {
            throw new TypeError(`Expected 'playgroundData' to be of type 'object', got: '${typeof dataTransferObject.playgroundData}'`);
        }
        validatePlaygroundDataV1(dataTransferObject.playgroundData);
        break;
    }
    default: {
        throw new TypeError(`Interface version given does not exist: ${dataTransferObject.interfaceVersion}`);
    }
    }
}

function validatePlaygroundDataV1(playgroundData: PlaygroundDataV1) {
    for (const stringKey of ['policy', 'schema', 'entities', 'context'] as const) {
        if (typeof playgroundData[stringKey] !== 'string') {
            throw new TypeError(`Expected 'playgroundData.${stringKey}' to be of type 'string', got: '${typeof playgroundData[stringKey]}'`);
        }
    }
    for (const idKey of ['principal', 'action', 'resource'] as const) {
        const identifier = playgroundData[idKey];
        if (typeof identifier !== 'object') {
            throw new TypeError(`Expected 'playgroundData.${idKey}' to be of type 'object', got: '${typeof identifier}'`);
        }
        if (!('type' in identifier) || !('id' in identifier)){
            throw new TypeError(`Expected 'playgroundData.${idKey}' to have keys 'type' and 'id', got: '${Object.keys(identifier).join(', ')}'`);
        }
        if (typeof identifier.type !== 'string'){
            throw new TypeError(`Expected 'playgroundData.${idKey}.type' to have type 'string', got: '${typeof identifier.type}'`);
        }
        if (typeof identifier.id !== 'string'){
            throw new TypeError(`Expected 'playgroundData.${idKey}.id' to have type 'string', got: '${typeof identifier.id}'`);
        }
    }
    if (typeof playgroundData.isAVPFormat !== 'boolean') {
        throw new TypeError(`Expected 'playgroundData.isAVPFormat' to be of type 'boolean' got: ${typeof playgroundData.isAVPFormat}`);
    }
}

function minifyJson(jsonStr: string) {
    // Remove whitespace from JSON field of playground state if it's valid, otherwise do nothing
    if (typeof jsonStr !== 'string'){
        return jsonStr;
    }
    try {
        return JSON.stringify(JSON.parse(jsonStr));
    } catch (e) {
        return jsonStr;
    }
}

function formatJson(jsonStr: string, spaces = 4) {
    // Add whitespace back to JSON field of playground if it was valid when exported, otherwise do nothing
    if (typeof jsonStr !== 'string'){
        return jsonStr;
    }
    try {
        return JSON.stringify(JSON.parse(jsonStr), null, spaces);
    } catch (e) {
        return jsonStr;
    }
}

function uint8ArrayToBase64( array: Uint8Array ): string {
    let binary = '';
    for (let i = 0; i < array.byteLength; i++) {
        binary += String.fromCharCode(array[i]);
    }
    return window.btoa( binary );
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
