import React, { useEffect } from 'react';
import { Box, Button, Container, Grid, SpaceBetween } from '@cloudscape-design/components';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getLocaleFromPath } from '../../util/intlHelpers';
import { useTranslations } from '../../hooks/useTranslations';
import CedarIntl from '../../components/CedarIntl';
import { isMobile } from '../../util/miscHelpers';

const gridDefinition2Col = [
    { colspan: 8, offset: 2 },
    { colspan: 2 },
];
const gridDefinition1Col = [
    { colspan: 12 },
];

export interface TutorialStepDetails{
    element: JSX.Element;
    navLabelKey: string;
    route: string;
}

export default function Tutorial(props: {steps: TutorialStepDetails[]}) {
    const { steps } = props;
    const { '*': stepRouteParam } = useParams();
    const { t } = useTranslations();

    const gridDefinition = isMobile() ? gridDefinition1Col : gridDefinition2Col;
    const navigate = useNavigate();
    const locale = getLocaleFromPath(window.location.pathname);

    useEffect(() => {
        document.title = t('pageTitles.tutorial');
    }, []);

    let currentStep = steps.findIndex((step) => step.route === stepRouteParam);
    if (currentStep < 0) {
        currentStep = 0;
    }

    let primaryButtonCaption = t('tutorial.nextStepButton');
    let primaryButtonClickHandler = () => {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        navigate(`/${locale}/tutorial/${steps[currentStep + 1].route}`);
    };
    if (currentStep === steps.length - 1) {
        primaryButtonCaption = t('tutorial.finishButton');
        primaryButtonClickHandler = () => navigate(`/${locale}/playground`);
    }
    return (
        <Box margin={'xxl'} padding={{ bottom: 'xxxl' }}>
            <Grid
                gridDefinition={gridDefinition}
            >
                {steps[currentStep].element}
                {
                    !isMobile() &&
                    <Container>
                        {
                            steps.map((step, idx) => {
                                let label;
                                if (idx === currentStep) {
                                    label = <strong>{`${idx + 1} ${t(step.navLabelKey)}`}</strong>;
                                } else {
                                    label = `${idx + 1} ${t(step.navLabelKey)}`;
                                }
                                return (
                                    <p key={idx} >
                                        <Link to={`/${locale}/tutorial/${step.route}`}>{label}</Link>
                                    </p>
                                );
                            })
                        }
                    </Container>
                }
            </Grid>
            <Box float={'right'}>
                <SpaceBetween size={'xl'} direction={'horizontal'}>
                    {
                        currentStep > 0 &&
                            <Button
                                onClick={() => navigate(`/${locale}/tutorial/${steps[currentStep - 1].route}`)}
                                data-testid={'previous-tutorial-step'}
                            >
                                <CedarIntl
                                    id='tutorial.previousStepButton'
                                    defaultMessage='Previous step'
                                />
                            </Button>
                    }
                    <Button variant={'primary'} onClick={primaryButtonClickHandler} data-testid={'next-tutorial-step'}>
                        {primaryButtonCaption}
                    </Button>
                </SpaceBetween>
            </Box>
        </Box>
    );
}
