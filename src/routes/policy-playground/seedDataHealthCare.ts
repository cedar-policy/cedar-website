import type { CedarEntity } from '../../cedar-utils';
import type { SampleApp } from './types';

// String of one or more policies written in the Cedar language
const policy = `// Admins can perform any action
permit (
    principal in HealthCareApp::Role::"admin",
    action,
    resource
);

// Patients can view their own appointments
permit (
    principal,
    action == HealthCareApp::Action::"viewAppointment",
    resource is HealthCareApp::Appointment
)
when { resource.patient == principal };

// Doctors can view appointments where they are the provider
permit (
    principal in HealthCareApp::Role::"doctor",
    action == HealthCareApp::Action::"viewAppointment",
    resource is HealthCareApp::Appointment
)
when { resource.provider == principal };

// Patients can create appointments when referred by a doctor
permit (
    principal,
    action == HealthCareApp::Action::"createAppointment",
    resource is HealthCareApp::Patient
)
when {
    resource.associatedUser == principal &&
    context.referrer in HealthCareApp::Role::"doctor"
};
`;

const schema = `namespace HealthCareApp {
  entity Role;

  entity User in [Role] = {
    displayName: String
  };

  entity Patient = {
    associatedUser: User
  };

  entity Appointment in [Patient] = {
    provider: User,
    patient: User
  };

  action viewAppointment appliesTo {
    principal: [User],
    resource: [Appointment]
  };

  action updateAppointment appliesTo {
    principal: [User],
    resource: [Appointment]
  };

  action deleteAppointment appliesTo {
    principal: [User],
    resource: [Appointment]
  };

  action createAppointment appliesTo {
    principal: [User],
    resource: [Patient],
    context: {
      referrer: User
    }
  };

  action listAppointments appliesTo {
    principal: [User],
    resource: [Patient]
  };
}`;

export const context: string = JSON.stringify(
    {
        referrer: {
            __entity: {
                type: 'HealthCareApp::User',
                id: 'DrSeuz',
            },
        },
    },
    null,
    2,
);

// Query 1: Admin (Victor) views an appointment — allowed via admin role
const query1Entities: CedarEntity[] = [
    {
        uid: { type: 'HealthCareApp::User', id: 'Victor' },
        attrs: { displayName: 'Victor' },
        parents: [{ type: 'HealthCareApp::Role', id: 'admin' }],
    },
    {
        uid: { type: 'HealthCareApp::Role', id: 'admin' },
        attrs: {},
        parents: [],
    },
    {
        uid: { type: 'HealthCareApp::Appointment', id: 'appointment003' },
        attrs: {
            provider: { __entity: { type: 'HealthCareApp::User', id: 'DrSeuz' } },
            patient: { __entity: { type: 'HealthCareApp::User', id: 'Victor' } },
        },
        parents: [{ type: 'HealthCareApp::Patient', id: 'Victor' }],
    },
    {
        uid: { type: 'HealthCareApp::Patient', id: 'Victor' },
        attrs: { associatedUser: { __entity: { type: 'HealthCareApp::User', id: 'Victor' } } },
        parents: [],
    },
    {
        uid: { type: 'HealthCareApp::User', id: 'DrSeuz' },
        attrs: { displayName: 'Dr. Seuz' },
        parents: [{ type: 'HealthCareApp::Role', id: 'doctor' }],
    },
    {
        uid: { type: 'HealthCareApp::Role', id: 'doctor' },
        attrs: {},
        parents: [],
    },
];

// Query 2: Patient (Sarah) creates an appointment with a doctor referral — allowed via referrer pattern
const query2Entities: CedarEntity[] = [
    {
        uid: { type: 'HealthCareApp::User', id: 'Sarah' },
        attrs: { displayName: 'Sarah' },
        parents: [],
    },
    {
        uid: { type: 'HealthCareApp::Patient', id: 'Sarah' },
        attrs: { associatedUser: { __entity: { type: 'HealthCareApp::User', id: 'Sarah' } } },
        parents: [],
    },
    {
        uid: { type: 'HealthCareApp::User', id: 'DrSeuz' },
        attrs: { displayName: 'Dr. Seuz' },
        parents: [{ type: 'HealthCareApp::Role', id: 'doctor' }],
    },
    {
        uid: { type: 'HealthCareApp::Role', id: 'doctor' },
        attrs: {},
        parents: [],
    },
];

export const healthCareSampleApp: SampleApp = {
    name: 'HealthCare',
    policy,
    schema,
    queries: [
        {
            queryTitle: 'Admin views an appointment',
            principal: { type: 'HealthCareApp::User', id: 'Victor' },
            action: { type: 'HealthCareApp::Action', id: 'viewAppointment' },
            resource: { type: 'HealthCareApp::Appointment', id: 'appointment003' },
            context: '{}',
            entities: JSON.stringify(query1Entities, null, 4),
        },
        {
            queryTitle: 'Patient creates appointment with doctor referral',
            principal: { type: 'HealthCareApp::User', id: 'Sarah' },
            action: { type: 'HealthCareApp::Action', id: 'createAppointment' },
            resource: { type: 'HealthCareApp::Patient', id: 'Sarah' },
            context,
            entities: JSON.stringify(query2Entities, null, 4),
        },
    ],
};
