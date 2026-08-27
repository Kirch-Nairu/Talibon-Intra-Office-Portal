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
    return (
        <AppLayout title="Dashboard">
            <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">
                <DashboardHeader experience={experience} />

                {metricGroups.map((group) => <MetricGroup key={group.key} group={group} />)}

                <QuickActions actions={experience.quickActions} />

                {officeOverview ? <OfficeOverview overview={officeOverview} /> : null}
                {executiveOverview ? <ExecutiveOverview overview={executiveOverview} /> : null}
                {systemOverview ? <SystemOverview overview={systemOverview} /> : null}

                {correspondenceOverview ? <CorrespondenceOverview overview={correspondenceOverview} /> : null}

                {recentWork.length > 0 ? (
                    <RecentWorkList
                        title="Recently updated personal work"
                        description="Latest transactions assigned to you or initiated by you inside existing authorization."
                        items={recentWork}
                    />
                ) : null}
            </div>
        </AppLayout>
    );
}
