import React from 'react';
import { Link } from '@cloudscape-design/components';
import CedarIntl from './CedarIntl';

/** Type to specify estimated time for learning item. Accepts number or time range as string. */
type Duration = {
    hours?: number | string;
    minutes?: number | string
}

interface LearningPathListItemProps extends React.PropsWithChildren {
    title: React.ReactNode;
    href?: string;
    duration?: Duration;
}

export default function LearningPathListItem(props: LearningPathListItemProps) {
    let hoursMessage: React.ReactNode = null;
    let minsMessage: React.ReactNode = null;
    if (`${props.duration?.hours}` === '1') {
        hoursMessage = <>
            &nbsp;
            <CedarIntl id='learn.oneHour' defaultMessage='1 hour'/>
        </>;
    } else if (props.duration?.hours) {
        hoursMessage = <>
            &nbsp;
            <CedarIntl
                id='learn.hours'
                defaultMessage='{num} hours'
                values={{ num: props.duration.hours }}
            />
        </>;
    }

    if (`${props.duration?.minutes}` === '1') {
        minsMessage = <>
            &nbsp;
            <CedarIntl id='learn.oneMinute' defaultMessage='1 minute'/>
        </>;
    } else if (props.duration?.minutes) {
        minsMessage = <>
            &nbsp;
            <CedarIntl
                id='learn.minutes'
                defaultMessage='{num} minutes'
                values={{ num: props.duration.minutes }}
            />
        </>;
    }

    return (<li>
        <h4>
            {props.href
                ? <Link
                    href={props.href}
                    target='_blank'
                    external
                >
                    {props.title}
                </Link>
                : props.title
            }
        </h4>
        {props.children}
        { props.duration &&
            <p><i>
                <CedarIntl
                    id='learn.estimatedTime'
                    defaultMessage='Estimated time:'
                />
                {hoursMessage}
                {minsMessage}
            </i></p>
        }
    </li>);
}
