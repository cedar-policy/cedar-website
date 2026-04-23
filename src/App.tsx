import React, { Suspense } from 'react';
import { Toaster } from 'sonner';
import '@cloudscape-design/global-styles/index.css';
import './styles.scss';
import PolicyPlayground from './routes/policy-playground/PolicyPlayground';
import { Box, Spinner, TopNavigation } from '@cloudscape-design/components';
import {
    Routes,
    Route,
    useNavigate,
    useLocation,
    Navigate,
} from 'react-router-dom';
import Overview from './routes/overview';
import Tutorial, { TutorialStepDetails } from './routes/tutorial';
import StepPolicyStructure from './routes/tutorial/StepPolicyStructure';
import StepRBAC from './routes/tutorial/StepRBAC';
import StepContext from './routes/tutorial/StepContext';
import StepABAC from './routes/tutorial/StepABAC';
import StepABAC2 from './routes/tutorial/StepABAC2';
import StepForbid from './routes/tutorial/StepForbid';
import StepSets from './routes/tutorial/StepSets';
import StepUndefinedScopes from './routes/tutorial/StepUndefinedScopes';
import AWSVerifiedAccessPlayground from './routes/aws-verified-access/AWSVerifiedAccessPlayground';
import WasmErrorBoundary from './components/WasmErrorBoundary';
import { getLocaleFromPath } from './util/intlHelpers';
import { defaultLocale } from './translations/configuration';
import StarRedirect from './components/StarRedirect';
import CedarIntl from './components/CedarIntl';
import { useTranslations } from './hooks/useTranslations';
import { isMobile } from './util/miscHelpers';
import SchemaTutorialStep from './routes/tutorial/SchemaTutorialStep';
import PolicyTemplatesStep from './routes/tutorial/PolicyTemplatesStep';
import Integrations from './routes/integrations/Integrations';
import Learn from './routes/learn/Learn';
import cedarLogo from '../static/logo.svg';
import { BlogList } from './routes/blog/BlogList';
import * as BlogEntryLazyImports from './routes/blogEntries';
import IntroducingAvp from './routes/integrations/IntroducingAvp';
import GettingStartedAvp from './routes/integrations/GettingStartedAvp';

const steps: TutorialStepDetails[] = [
    {
        element: <StepPolicyStructure />,
        navLabelKey: 'tutorial.policyStructure.label',
        route: 'policy-structure',
    },
    {
        element: <StepForbid />,
        navLabelKey: 'tutorial.forbid.label',
        route: 'forbid',
    },
    {
        element: <StepSets />,
        navLabelKey: 'tutorial.sets.label',
        route: 'sets',
    },
    {
        element: <StepUndefinedScopes />,
        navLabelKey: 'tutorial.undefinedScopes.label',
        route: 'undefined-scope',
    },
    {
        element: <StepRBAC />,
        navLabelKey: 'tutorial.rbac.label',
        route: 'rbac',
    },
    {
        element: <StepABAC />,
        navLabelKey: 'tutorial.abacPt1.label',
        route: 'abac-pt1',
    },
    {
        element: <StepABAC2 />,
        navLabelKey: 'tutorial.abacPt2.label',
        route: 'abac-pt2',
    },
    {
        element: <StepContext />,
        navLabelKey: 'tutorial.context.label',
        route: 'context',
    },
    {
        element: <SchemaTutorialStep />,
        navLabelKey: 'tutorial.schema.label',
        route: 'schema',
    },
    {
        element: <PolicyTemplatesStep />,
        navLabelKey: 'tutorial.templates.label',
        route: 'policy-templates',
    },
];

export const routes = [
    {
        path: '/:lang',
        element: <Overview />,
    },
    {
        path: '/:lang/tutorial/*',
        element: (
            <Tutorial
                steps={steps}
            />
        ),
    },
    {
        path: '/:lang/playground',
        element: <PolicyPlayground />,
    },
    {
        path: '/:lang/sandbox',
        element: <PolicyPlayground />,
    },
    {
        path: '/:lang/aws-verified-access',
        element: <AWSVerifiedAccessPlayground />,
    },
    {
        path: '/:lang/integrations',
        element: <Integrations />,
    },
    {
        path: '/:lang/integrations/introducing-avp',
        element: <IntroducingAvp />,
    },
    {
        path: '/:lang/integrations/getting-started-avp',
        element: <GettingStartedAvp />,
    },
    {
        path: '/:lang/learn',
        element: <Learn />,
    },
    {
        path: '/',
        element: <Navigate to={`/${defaultLocale}`} replace/>,
    },
    {
        path: '/tutorial/*',
        element: <StarRedirect to={`/${defaultLocale}/tutorial`}/>,
    },
    {
        path: '/learn',
        element: <Navigate to={`/${defaultLocale}/learn`} replace/>,
    },
    {
        path: '/playground',
        element: <Navigate to={`/${defaultLocale}/playground`} replace/>,
    },
    {
        path: '/sandbox',
        element: <Navigate to={`/${defaultLocale}/playground`} replace/>,
    },
    {
        path: '/aws-verified-access',
        element: <Navigate to={`/${defaultLocale}/aws-verified-access`} replace/>,
    },
    {
        path: '/blog',
        element: <BlogList />,
    },
    ...Object.entries(BlogEntryLazyImports)
        .filter(([blogEntryComponentName, _]) => {
            // filter out the generic properties of a module, like symbol and default
            return blogEntryComponentName.includes('_');
        })
        .map(([_, BlogEntryDefn]) => {
            const slug = BlogEntryDefn.slug;
            const BlogEntryComponent = BlogEntryDefn.lazyImport;
            return {
                path: `/blog/${slug}`,
                element: <BlogEntryComponent />,
            };
        }),
];

export default function App() {
    const { t } = useTranslations();
    const navigate = useNavigate();
    const location = useLocation();
    const locale = getLocaleFromPath(location.pathname);
    // TODO: Add cookie consent solution here if needed
    const showNav = !location.pathname.includes('aws-verified-access');
    const pathsWithoutCedarTitle = [`/${locale}/`, `/${locale}`];
    const onOverviewPage = pathsWithoutCedarTitle.includes(location.pathname);

    // TODO: Add your own privacy policy and site terms links here
    const bottomBarLinks = (<></>);

    return (
        <Box data-testid={'entrypoint'} className={'app-container'}>
            <div className={onOverviewPage ? 'cedar-green' : undefined}>
                {
                    showNav && (
                        <div className={onOverviewPage ? 'transparent-dark-bg' : 'cedar-green'}>
                            <TopNavigation
                                identity={{
                                    href: `/${locale}`,
                                    logo: { src: cedarLogo, alt: t('topNavbar.cedarTitle') },
                                }}
                                utilities={[
                                    {
                                        type: 'button',
                                        text: t('topNavbar.overview'),
                                        href: `/${locale}`,
                                        external: false,
                                        onClick: (e) => {
                                            e.preventDefault();
                                            navigate(`/${locale}`);
                                        },
                                    },
                                    {
                                        type: 'menu-dropdown',
                                        text: t('topNavbar.learn'),
                                        items: [
                                            {
                                                id: 'learningPath',
                                                text: t('learn.title2'),
                                                href: `/${locale}/learn`,
                                            },
                                            {
                                                id: 'tutorial',
                                                text: t('learn.tutorial.header'),
                                                href: `/${locale}/tutorial`,
                                            },
                                            {
                                                id: 'tutorial',
                                                text: t('learn.cedarGuide.header'),
                                                external: true,
                                                href: 'http://docs.cedarpolicy.com',
                                            },
                                            {
                                                id: 'blog',
                                                text: 'Blog',
                                                href: '/blog',
                                            },
                                        ],
                                        onItemFollow: (e) => {
                                            if (!e.detail.external && e.detail.href) {
                                                e.preventDefault();
                                                navigate(e.detail.href);
                                            }
                                        },
                                    },
                                    {
                                        type: 'button',
                                        text: t('topNavbar.policyPlayground'),
                                        href: `/${locale}/playground`,
                                        external: false,
                                        onClick: (e) => {
                                            e.preventDefault();
                                            navigate(`/${locale}/playground`);
                                        },
                                    },
                                    {
                                        type: 'button',
                                        text: t('topNavbar.integrations'),
                                        href: `/${locale}/integrations`,
                                        external: false,
                                        onClick: (e) => {
                                            e.preventDefault();
                                            navigate(`/${locale}/integrations`);
                                        },
                                    },
                                    {
                                        type: 'button',
                                        text: t('topNavbar.cedarSDK.link'),
                                        href: 'https://github.com/cedar-policy',
                                        external: true,
                                        externalIconAriaLabel: t('topNavbar.cedarSDK.ariaLabel'),
                                        iconSvg: <img src={'/github.svg'} alt={t('topNavbar.cedarSDK.iconAltText')}/>,
                                    },
                                ]}
                                i18nStrings={{
                                    searchIconAriaLabel: '',
                                    searchDismissIconAriaLabel: '',
                                    overflowMenuTriggerText: t('topNavbar.overflowMenu.triggerText'),
                                    overflowMenuTitleText: t('topNavbar.overflowMenu.titleText'),
                                    overflowMenuBackIconAriaLabel: t('topNavbar.overflowMenu.backAriaLabel'),
                                    overflowMenuDismissIconAriaLabel: t('topNavbar.overflowMenu.closeAriaLabel'),
                                }}
                            />
                        </div>
                    )
                }
                <WasmErrorBoundary>
                    <Toaster position='top-center' richColors visibleToasts={3} closeButton />
                    <Suspense fallback={<Spinner />}>
                        <Routes>
                            {
                                routes.map(routeInfo =>
                                    <Route key={routeInfo.path} path={routeInfo.path} element={routeInfo.element} />,
                                )
                            }
                        </Routes>
                    </Suspense>
                </WasmErrorBoundary>
                <div className={'bottom-bar flex-row'}>
                    {bottomBarLinks}
                </div>
            </div>
        </Box>
    );
}
