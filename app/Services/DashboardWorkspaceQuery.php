<?php

namespace App\Services;

use App\Models\User;

final class DashboardWorkspaceQuery
{
    public function __construct(
        private readonly DashboardTransactionQuery $transactions,
        private readonly DashboardCorrespondenceQuery $correspondence,
    ) {
    }

    public function workspace(User $actor): array
    {
        $actor->loadMissing('employee.department');
        $department = $actor->employee?->department;
        abort_unless($department, 403);

        $transaction = $this->transactions->workspace($actor);
        $correspondence = $this->correspondence->workspace($actor);

        $props = [
            'workspace' => [
                'departmentName' => $department->name,
                'departmentCode' => $department->code,
                'canSeeMunicipalOverview' => $transaction['canSeeMunicipalOverview'],
            ],
            'departmentMetrics' => $transaction['departmentMetrics'],
            'correspondenceAttention' => $correspondence['attention'],
            'correspondenceStatus' => $correspondence['status'],
            'recentlyReceivedCorrespondence' => $correspondence['recentlyReceived'],
            'recentlyRoutedCorrespondence' => $correspondence['recentlyRouted'],
            'recentWork' => $transaction['recentWork'],
        ];

        if ($transaction['canSeeMunicipalOverview']) {
            $props['municipalOverview'] = $transaction['municipalOverview'];
            $props['departmentWorkload'] = $transaction['departmentWorkload'];
        }

        return $props;
    }
}
