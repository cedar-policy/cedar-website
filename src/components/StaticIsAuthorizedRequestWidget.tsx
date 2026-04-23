import React from 'react';
import { Button, Icon, Tabs } from '@cloudscape-design/components';
import './StaticIsAuthorizedRequestWidget.scss';
import CedarIntl from './CedarIntl';

type SupportedLanguage = 'rust';

interface StaticIsAuthorizedRequestWidgetProps {
    code: Record<SupportedLanguage, React.ReactNode>;
    onClickPrimaryAction: () => void;
    buttonDisabled: boolean;
}

export default function StaticIsAuthorizedRequestWidget(props: StaticIsAuthorizedRequestWidgetProps) {
    const { code, onClickPrimaryAction, buttonDisabled } = props;

    return (
        <div className={'global-container'}>
            <div className={'primary-action-btn'}>
                <Button
                    data-testid={'evaluate-button'}
                    disabled={buttonDisabled}
                    variant={'primary'}
                    onClick={onClickPrimaryAction}
                >
                    <Icon name={'caret-right-filled'} />
                    <CedarIntl
                        id='tutorial.evaluate'
                        defaultMessage='Evaluate'
                    />
                </Button>
            </div>
            <div className="tabs-wrapper">
                <Tabs
                    variant={'container'}
                    tabs={[
                        {
                            label: 'Rust',
                            id: 'rust',
                            content: code.rust,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
