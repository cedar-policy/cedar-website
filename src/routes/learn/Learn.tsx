import React from 'react';
import { Box, Link, SpaceBetween } from '@cloudscape-design/components';
import CedarIntl from '../../components/CedarIntl';
import LearningPathListItem from '../../components/LearningPathListItem';
import { getLocaleFromPath } from '../../util/intlHelpers';

export default function Learn() {
    const locale = getLocaleFromPath(window.location.pathname);
    return <Box padding={{ left: 'xxxl', vertical: 'm' }}>
        <div className='medium-container'>
            <SpaceBetween size='s'>
                <h1>
                    <CedarIntl
                        id='learn.title2'
                        defaultMessage='Learn Cedar'
                    />
                </h1>
                <div>
                    <h2>
                        <CedarIntl
                            id='learn.gettingStarted.title'
                            defaultMessage='1. Getting started'
                        />
                    </h2>
                    <p>
                        <CedarIntl
                            id='learn.gettingStarted.description'
                            defaultMessage='Learn what Cedar is, why it was created, and the basic constructs to be able to create, evaluate and validate policies.'
                        />
                    </p>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.gettingStarted.theBasics.title'
                            defaultMessage='Cedar 101 - The basics'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.gettingStarted.theBasics.introVideo.title'
                                defaultMessage='Watch a short video clip introducing Cedar (from 1:31 to 10:13)'
                            />}
                            href='https://youtu.be/vDLI9w9Z-R8?t=92'
                            duration={{ minutes: 10 }}
                        >
                            <CedarIntl
                                id='learn.gettingStarted.theBasics.introVideo.description'
                                defaultMessage='This video clip introduces Cedar and explains why we built it.'
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.gettingStarted.theBasics.keyTerms.title'
                                defaultMessage='Learn the key terms'
                            />}
                            duration={{ minutes: 40 }}
                        >
                            <p>
                                <CedarIntl
                                    id='learn.gettingStarted.theBasics.keyTerms.description'
                                    defaultMessage='Read the descriptions for the following key terms in the documentation:'
                                />
                            </p>
                            <ul>
                                <li>
                                    <Link
                                        external
                                        href='https://docs.cedarpolicy.com/overview/terminology.html#term-authorization'
                                    >
                                        <CedarIntl
                                            id='learn.gettingStarted.theBasics.keyTerms.authorization'
                                            defaultMessage='Authorization'
                                        />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        external
                                        href='https://docs.cedarpolicy.com/overview/terminology.html#term-policy'
                                    >
                                        <CedarIntl
                                            id='learn.gettingStarted.theBasics.keyTerms.policy'
                                            defaultMessage='Policy'
                                        />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        external
                                        href='https://docs.cedarpolicy.com/overview/terminology.html#term-policy-evaluation'
                                    >
                                        <CedarIntl
                                            id='learn.gettingStarted.theBasics.keyTerms.evaluation'
                                            defaultMessage='Evaluation'
                                        />
                                    </Link>
                                </li>
                            </ul>
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.gettingStarted.theBasics.cedarTutorial.title'
                                defaultMessage='Go through the Cedar Tutorial'
                            />}
                            href={`/${locale}/tutorial`}
                            duration={{ hours: '1-2' }}
                        >
                            <CedarIntl
                                id='learn.gettingStarted.theBasics.cedarTutorial.description'
                                defaultMessage='Complete the interactive Cedar tutorial to see examples of policies and demonstrate the key constructs of the language.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='learn.cedarInAction.title'
                            defaultMessage='2. Cedar in action'
                        />
                    </h2>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.cedarInAction.cedarCli.title'
                            defaultMessage='Cedar 201 - The Cedar CLI'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.cedarInAction.cedarCli.demoVideo.title'
                                defaultMessage='Watch Mike Hicks demonstrate the Cedar CLI tool'
                            />}
                            href='https://youtu.be/PzmDYyyA5xM?t=46'
                            duration={{ minutes: 14 }}
                        >
                            <CedarIntl
                                id='learn.cedarInAction.cedarCli.demoVideo.description'
                                defaultMessage='Mike demonstrates how to create and evaluate policies using the Cedar CLI tool for the TinyToDo app.'
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.cedarInAction.cedarCli.demoBlog.title'
                                defaultMessage='TinyToDo demo app blog post'
                            />}
                            href='https://aws.amazon.com/blogs/opensource/using-open-source-cedar-to-write-and-enforce-custom-authorization-policies/'
                        >
                            <CedarIntl
                                id='learn.cedarInAction.cedarCli.demoBlog.description'
                                defaultMessage='See also this blog from Mike, which walks you through the TinyToDo app that he demos in the above video.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.cedarInAction.customerStories.title'
                            defaultMessage='Cedar 202 - Customer stories'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.cedarInAction.customerStories.fis.title'
                                defaultMessage='Watch Fidelity Information Services demonstrate how they use Cedar'
                            />}
                            href='https://youtu.be/TOyHpLnLatk?t=1177'
                            duration={{ minutes: 10 }}
                        >
                            <CedarIntl
                                id='learn.cedarInAction.customerStories.fis.description'
                                defaultMessage='Ana from FIS demonstrates how their Prophet application uses Cedar policies to define and role based permissions that are constrained by attribute based conditions.'
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.cedarInAction.customerStories.strongDm.title'
                                defaultMessage='Watch StrongDM demonstrate how they use Cedar'
                            />}
                            href='https://youtu.be/vDLI9w9Z-R8?t=1063'
                            duration={{ minutes: 10 }}
                        >
                            <CedarIntl
                                id='learn.cedarInAction.customerStories.strongDm.description'
                                defaultMessage='Justin from StrongDM explains why they chose Cedar and how they use it for data level access.'
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.cedarInAction.customerStories.twilio.title'
                                defaultMessage='Listen to Twilio talk about how they use Cedar'
                            />}
                            href='https://youtu.be/HyQsohJLywA?t=511'
                            duration={{ minutes: '10-20' }}
                        >
                            <CedarIntl
                                id='learn.cedarInAction.customerStories.twilio.description'
                                defaultMessage='Hear Peter from Twilio explain why they chose a policy based authorization system over a graph based system.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='learn.diveDeeper.title'
                            defaultMessage='3. Dive deeper'
                        />
                    </h2>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.authorization.title'
                            defaultMessage='Cedar 301 - Anatomy of an authorization request'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.authorization.requestDocs'
                                defaultMessage='Documentation on constructing an authorization request'
                            />}
                            href='https://docs.cedarpolicy.com/auth/authorization.html'
                            duration={{ minutes: 15 }}
                        />
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.authorization.entitiesDocs'
                                defaultMessage='Documentation on entity data and context'
                            />}
                            href='https://docs.cedarpolicy.com/auth/entities-syntax.html'
                            duration={{ minutes: 15 }}
                        />
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.authorization.cedarWorkshop.title'
                                defaultMessage='Do the Cedar workshop'
                            />}
                            href='https://catalog.workshops.aws/cedar-policy-language-in-action/en-US'
                            duration={{ hours: '1-2' }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.authorization.cedarWorkshop.description'
                                defaultMessage={'The first section of the workshop will serve as a refresher for some of the content already covered. The sections on \'Entity Sets\' and \'Attributes\' get into more depth on how to use and pass entity data within your authorization model.'}
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.authorization.entitiesVideo.title'
                                defaultMessage='Watch the Cedarcraft video on Enriching Cedar Policies and the Need for Validation'
                            />}
                            href='https://www.youtube.com/watch?v=eBUerHynfYU'
                            duration={{ minutes: 10 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.authorization.entitiesVideo.description'
                                defaultMessage='This video covers how to handle entity data in Cedar.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.designPatterns.title'
                            defaultMessage='Cedar 302 - Policy design patterns'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.designPatterns.guidance.title'
                                defaultMessage='Read guidance on Cedar policy design patterns'
                            />}
                            href='https://docs.cedarpolicy.com/overview/patterns.html'
                            duration={{ minutes: 15 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.designPatterns.guidance.description'
                                defaultMessage='Read the design patterns section in the Cedar documentation to learn how Cedar can be used to implement Role Based Access Control (RBAC) and Relationship based Access Control (ReBAC).'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.whyAwsMadeCedar.title'
                            defaultMessage='Cedar 303 - Learn why AWS created Cedar,  and how we went about it'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.whyAwsMadeCedar.leanTogether.title'
                                defaultMessage='Lean Together 2024: Emina Torlak, Cedar'
                            />}
                            href='https://youtu.be/KC6rlcsHUVs?t=364'
                            duration={{ minutes: 40 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.whyAwsMadeCedar.leanTogether.description'
                                defaultMessage='Emina, one of the originators of Cedar, explains why and how AWS set about creating Cedar.'
                            />
                        </LearningPathListItem>
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.whyAwsMadeCedar.blog.title'
                                defaultMessage='How we built Cedar with automated reasoning and differential testing'
                            />}
                            href='https://www.amazon.science/blog/how-we-built-cedar-with-automated-reasoning-and-differential-testing'
                            duration={{ minutes: 20 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.whyAwsMadeCedar.blog.description'
                                defaultMessage={'Mike, another Cedar creator, explains how we use automated reasoning to prove important correctness properties about formal models of Cedar\'s components, and then differential random testing to show that the models match the production code.'}
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.policyAnalysis.title'
                            defaultMessage='Cedar 304 - Policy Analysis'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.policyAnalysis.blog.title'
                                defaultMessage={'What\'s Analyzable'}
                            />}
                            href='https://www.cedarpolicy.com/blog/whats-analyzable'
                            duration={{ minutes: 20 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.policyAnalysis.blog.description'
                                defaultMessage='Read the blog explaining why a core tenet of Cedar is its analyzability.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.securityByDesign.title'
                            defaultMessage='Cedar 305 - Security by design'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.securityByDesign.securityReport.title'
                                defaultMessage={'Comparative Language Security Assessment'}
                            />}
                            href='https://github.com/trailofbits/publications/blob/master/reports/Policy_Language_Security_Comparison_and_TM.pdf'
                        >
                            <CedarIntl
                                id='learn.diveDeeper.securityByDesign.securityReport.description'
                                defaultMessage='A report from security advisors Trail of Bits providing a comparison of the Cedar, Rego and OpenFGA languages.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.oopsla.title'
                            defaultMessage='Cedar 306 - OOPSLA article on Cedar'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.oopsla.article.title'
                                defaultMessage={'Cedar: A New Language for Expressive, Fast, Safe, and Analyzable Authorization'}
                            />}
                            href='https://www.amazon.science/publications/cedar-a-new-language-for-expressive-fast-safe-and-analyzable-authorization'
                            duration={{ hours: '1-2' }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.oopsla.article.description'
                                defaultMessage='The article compares Cedar to two open-source languages, OpenFGA and Rego, and finds (subjectively) that Cedar has equally or more readable policies, but (objectively) performs far better.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.diveDeeper.partialEvaluation.title'
                            defaultMessage='Cedar 307 - Introducing Partial Evaluation'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.diveDeeper.partialEvaluation.cedarBlog.title'
                                defaultMessage={'A Quick Guide To Partial Evaluation'}
                            />}
                            href='https://www.cedarpolicy.com/blog/partial-evaluation'
                            duration={{ minutes: 20 }}
                        >
                            <CedarIntl
                                id='learn.diveDeeper.partialEvaluation.cedarBlog.description'
                                defaultMessage='Read the blog explaining how to use the experimental feature Partial Evaluation to construct data queries. Note that this is currently an experimental feature and should not be used in production.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                </div>
                <div>
                    <h2>
                        <CedarIntl
                            id='learn.getHandsOn.title'
                            defaultMessage='4. Get hands on'
                        />
                    </h2>
                    <LearningPathSection
                        title={<CedarIntl
                            id='learn.getHandsOn.github.title'
                            defaultMessage='Cedar 401 - Cedar on GitHub'
                        />}
                    >
                        <LearningPathListItem
                            title={<CedarIntl
                                id='learn.getHandsOn.github.cedarPolicy.title'
                                defaultMessage='The Cedar GitHub Repository'
                            />}
                            href='https://github.com/cedar-policy'
                        >
                            <CedarIntl
                                id='learn.getHandsOn.github.cedarPolicy.description'
                                defaultMessage='Visit the Cedar GitHub repo, download the SDK and start building. Review and comment on RFCs and submit pull requests.'
                            />
                        </LearningPathListItem>
                    </LearningPathSection>
                </div>
            </SpaceBetween>
        </div>
    </Box>;
}

function LearningPathSection(props: {title: React.ReactNode} & React.PropsWithChildren) {
    return <>
        <h3>{props.title}</h3>
        <ol>
            {props.children}
        </ol>
    </>;
}
