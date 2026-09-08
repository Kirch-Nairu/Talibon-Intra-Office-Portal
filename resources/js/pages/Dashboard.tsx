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
    const primaryKey = { employee: 'personal', department_head: 'office', executive_oversight: 'executive', system_administration: 'system' }[experience.key];
    const primaryGroups = metricGroups.filter((group) => group.key === primaryKey);
    const secondaryGroups = metricGroups.filter((group) => group.key !== primaryKey);
    const isSystem = experience.key === 'system_administration';
    return <AppLayout title="Dashboard">
        <div className="mx-auto max-w-[1600px] space-y-4">
            <DashboardHeader experience={experience} />
            <div className={isSystem ? 'space-y-4' : 'grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]'}>
                <div className="@container min-w-0 space-y-4">
                    {primaryGroups.map((group) => <MetricGroup key={group.key} group={group} />)}
                    {experience.key === 'department_head' && officeOverview && <OfficeOverview overview={officeOverview} />}
                    {experience.key === 'executive_oversight' && executiveOverview && <ExecutiveOverview overview={executiveOverview} />}
                    {isSystem && systemOverview && <SystemOverview overview={systemOverview} />}
                    {experience.key === 'department_head' && correspondenceOverview && <CorrespondenceOverview overview={correspondenceOverview} />}
                    {secondaryGroups.map((group) => <MetricGroup key={group.key} group={group} />)}
                    {!isSystem && (experience.key !== 'executive_oversight' || recentWork.length > 0) && <RecentWorkList
                        title="Recent work"
                        description="Latest updates to your assigned and initiated work."
                        items={recentWork}
                        emptyMessage="No recent work to show."
                    />}
                    {!isSystem && experience.key !== 'department_head' && correspondenceOverview && <CorrespondenceOverview overview={correspondenceOverview} />}
                    {isSystem && systemOverview && <ActivityRail system={systemOverview} />}
                    <QuickActions actions={experience.quickActions} />
                </div>
                {!isSystem && <ActivityRail correspondence={correspondenceOverview} />}
            </div>
        </div>
    </AppLayout>;
}
