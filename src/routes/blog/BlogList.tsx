import React, { useEffect } from 'react';
import blogEntries from '../blogRoutes.json';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Header, Link, SpaceBetween } from '@cloudscape-design/components';
import { useTranslations } from '../../hooks/useTranslations';

export function BlogList() {
    const navigate = useNavigate();
    const { t } = useTranslations();

    useEffect(() => {
        document.title = t('pageTitles.blog');
        return () => { document.title = t('pageTitles.cedarLang'); };
    }, []);

    return (
        <Box margin={{ left: 'xxxl', vertical: 'm' }}>
            <div className='medium-container'>
                <div>
                    <h1>Blog</h1>
                    <SpaceBetween size={'xxl'} direction={'vertical'}>
                        {
                            blogEntries.map(entry => {
                                return (
                                    <Container
                                        header={
                                            <Header variant={'h2'}>{entry.title}</Header>
                                        }
                                        key={entry.route}
                                    >
                                        <div
                                            onClick={() => navigate(entry.route)}
                                            onKeyDown={(event) => {
                                                if (event.code === 'Space') {
                                                    navigate(entry.route);
                                                }
                                                event.stopPropagation();
                                            }}
                                            tabIndex={0}
                                            role={'button'}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <p>{entry.summary}</p>
                                            <Link href={entry.route} onFollow={(e) => e.preventDefault()} >Read more</Link>
                                        </div>
                                    </Container>
                                );
                            })
                        }
                    </SpaceBetween>
                </div>
            </div>
        </Box>
    );
}
