import CorrespondenceOverview from '../components/dashboard/CorrespondenceOverview';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ExecutiveOverview from '../components/dashboard/ExecutiveOverview';
import MetricGroup from '../components/dashboard/MetricGroup';
import OfficeOverview from '../components/dashboard/OfficeOverview';
import QuickActions from '../components/dashboard/QuickActions';
import RecentWorkList from '../components/dashboard/RecentWorkList';
import SystemOverview from '../components/dashboard/SystemOverview';
import type { DashboardProps } from '../components/dashboard/types';
import AppLayout from '../layouts/AppLayout';

export default function Dashboard({
    experience,
    metricGroups,
    correspondenceOverview,
    recentWork,
    officeOverview,
    executiveOverview,
    systemOverview,
}: DashboardProps) {
    const metrics = metricGroups.map((group) => <MetricGroup key={group.key} group={group} />);
    const personalWork = (
        <RecentWorkList
            title="Recently updated personal work"
            description="Transactions assigned to you or initiated by you inside existing authorization."
            items={recentWork}
            emptyMessage="No recent personal work is waiting in this view."
        />
    );

    return (
        <AppLayout title="Dashboard">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5 lg:space-y-6">
                <DashboardHeader experience={experience} />

                {experience.key === 'employee' && (
                    <>
                        {metrics}
                        {correspondenceOverview ? <CorrespondenceOverview overview={correspondenceOverview} /> : null}
                        {personalWork}
                        <QuickActions actions={experience.quickActions} />
                    </>
                )}

                {experience.key === 'department_head' && (
                    <>
                        {metrics}
                        {officeOverview ? <OfficeOverview overview={officeOverview} /> : null}
                        {correspondenceOverview ? <CorrespondenceOverview overview={correspondenceOverview} /> : null}
                        {personalWork}
                        <QuickActions actions={experience.quickActions} />
                    </>
                )}

                {experience.key === 'executive_oversight' && (
                    <>
                        {metrics}
                        {executiveOverview ? <ExecutiveOverview overview={executiveOverview} /> : null}
                        <QuickActions actions={experience.quickActions} />
                        {correspondenceOverview ? <CorrespondenceOverview overview={correspondenceOverview} /> : null}
                        {recentWork.length > 0 ? personalWork : null}
                    </>
                )}

                {experience.key === 'system_administration' && (
                    <>
                        {metrics}
                        {systemOverview ? <SystemOverview overview={systemOverview} /> : null}
                        <QuickActions actions={experience.quickActions} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
