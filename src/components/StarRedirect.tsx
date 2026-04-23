import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export default function StarRedirect(props : {to: string}) {
    // Wrapper component for redirection of react-router splats/stars (eg. /route/*).
    const { '*': subRouteParam } = useParams();
    const redirectPath = (subRouteParam)
        ? `${props.to}/${subRouteParam}`
        : `${props.to}`;
    return <Navigate to={redirectPath} replace/>;
}
