import { PolicyPlaygroundState } from './PolicyPlayground';
import { photoFlashSampleApp } from './seedDataPhotoFlash';
import { healthCareSampleApp } from './seedDataHealthCare';
import { kubernetesApp } from './seedDataKubernetesAuthz';
import type { SampleAppName } from './types';
import { jitnaApp } from './seedDataJITNA';

export function getSeedDataForApp(
    appName: SampleAppName,
    authQueryIndex: number,
): PolicyPlaygroundState {
    let seedData;
    switch (appName) {
        case 'PhotoFlash':
            seedData = photoFlashSampleApp;
            break;
        case 'HealthCare':
            seedData = healthCareSampleApp;
            break;
        case 'Kubernetes':
            seedData = kubernetesApp;
            break;
        case 'JITNA':
            seedData = jitnaApp;
            break;
        default:
            throw new Error('unsupported sample app');
    }

    if (authQueryIndex >= seedData.queries.length) {
        authQueryIndex = seedData.queries.length - 1;
    }
    if (authQueryIndex < 0) {
        authQueryIndex = 0;
    }
    return {
        isAVPFormat: false,
        policy: seedData.policy,
        entities: seedData.queries[authQueryIndex].entities,
        principal: seedData.queries[authQueryIndex].principal,
        action: seedData.queries[authQueryIndex].action,
        resource: seedData.queries[authQueryIndex].resource,
        context: seedData.queries[authQueryIndex].context,
        queryChoices: seedData.queries.map((q) => q.queryTitle),
        schema: seedData.schema,
        sampleApp: appName,
        sampleQueryIndex: authQueryIndex,
    };
}
