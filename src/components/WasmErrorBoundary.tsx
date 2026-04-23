import React, { PropsWithChildren } from 'react';
import { Box, Header } from '@cloudscape-design/components';
import CedarIntl from './CedarIntl';

interface ErrorBoundaryState{
  error?: Error;
}

const genericErrorDisplay = <Box padding={'l'}>
    <Header variant='h1'>
        <CedarIntl
            id='errorBoundary.genericError'
            defaultMessage='An error occurred.'
        />
    </Header>
</Box>;

const wasmErrorDisplay = <Box padding={'l'}>
    <Header variant='h1'>
        <CedarIntl
            id='errorBoundary.wasmError.title'
            defaultMessage='An error occurred while loading WASM.'
        />
    </Header>
    <Box variant='p' padding={{ top: 'l' }}>
        <CedarIntl
            id='errorBoundary.wasmError.body'
            defaultMessage='Please use a browser compatible with WebAssembly, such as Chrome or Firefox.'
        />
    </Box>
</Box>;

export default class WasmErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
    constructor(props: PropsWithChildren) {
        super(props);
        this.state = {};
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            const isWasmLoadError = this.state.error.message.toLowerCase().includes('wbindgen');
            return isWasmLoadError ? wasmErrorDisplay : genericErrorDisplay;
        }
        return this.props.children;
    }
}
