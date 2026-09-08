import ActivityRail from '../components/dashboard/ActivityRail';
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

export default function Dashboard({ experience, metricGroups, correspondenceOverview, recentWork, officeOverview, executiveOverview, systemOverview }: DashboardProps) {
    const isSystem = experience.key === 'system_administration';
    return <AppLayout title="Dashboard">
        <div className="mx-auto max-w-[1600px] space-y-4">
            <DashboardHeader experience={experience} />
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="@container min-w-0 space-y-4">
                    {metricGroups.map((group) => <MetricGroup key={group.key} group={group} />)}
                    <QuickActions actions={experience.quickActions} />
                    {experience.key === 'department_head' && officeOverview && <OfficeOverview overview={officeOverview} />}
                    {experience.key === 'executive_oversight' && executiveOverview && <ExecutiveOverview overview={executiveOverview} />}
                    {isSystem && systemOverview && <SystemOverview overview={systemOverview} />}
                    {!isSystem && (experience.key !== 'executive_oversight' || recentWork.length > 0) && <RecentWorkList
                        title="Recently updated personal work"
                        description="Your assigned and initiated transactions, with the latest updates."
                        items={recentWork}
                        emptyMessage="No recent personal work is waiting in this view."
                    />}
                    {!isSystem && correspondenceOverview && <CorrespondenceOverview overview={correspondenceOverview} />}
                </div>
                <ActivityRail correspondence={isSystem ? undefined : correspondenceOverview} system={isSystem ? systemOverview : undefined} />
            </div>
        </div>
    </AppLayout>;
}
