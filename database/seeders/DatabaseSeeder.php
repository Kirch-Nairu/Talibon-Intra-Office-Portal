<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $departments = collect([
            ['code' => 'MAYOR', 'name' => "Mayor's Office", 'short_name' => 'Mayor'],
            ['code' => 'HRMO', 'name' => 'Human Resource Management Office', 'short_name' => 'HRMO'],
            ['code' => 'ENG', 'name' => 'Municipal Engineering Office', 'short_name' => 'Engineering'],
            ['code' => 'BUDGET', 'name' => 'Municipal Budget Office', 'short_name' => 'Budget'],
            ['code' => 'ACCOUNTING', 'name' => 'Municipal Accounting Office', 'short_name' => 'Accounting'],
            ['code' => 'TREASURY', 'name' => 'Municipal Treasury Office', 'short_name' => 'Treasury'],
            ['code' => 'MPDO', 'name' => 'Municipal Planning and Development Office', 'short_name' => 'Planning'],
            ['code' => 'SB', 'name' => 'Sangguniang Bayan / Legislative Office', 'short_name' => 'Legislative'],
        ])->mapWithKeys(function (array $data): array {
            $department = Department::query()->updateOrCreate(['code' => $data['code']], $data);
            return [$data['code'] => $department];
        });

        $accounts = [
            ['email' => 'admin@talibon.demo', 'name' => 'System Administrator', 'role' => 'system_admin', 'department' => 'MAYOR', 'position' => 'System Administrator'],
            ['email' => 'mayor@talibon.demo', 'name' => 'Mayor Office Approver', 'role' => 'mayor_approver', 'department' => 'MAYOR', 'position' => 'Approving Authority'],
            ['email' => 'engineering@talibon.demo', 'name' => 'Maria Santos', 'role' => 'department_head', 'department' => 'ENG', 'position' => 'Municipal Engineer'],
            ['email' => 'budget@talibon.demo', 'name' => 'Juan Cruz', 'role' => 'department_head', 'department' => 'BUDGET', 'position' => 'Municipal Budget Officer'],
            ['email' => 'hr@talibon.demo', 'name' => 'Elena Reyes', 'role' => 'hr_officer', 'department' => 'HRMO', 'position' => 'HR Management Officer'],
            ['email' => 'legislative@talibon.demo', 'name' => 'Paolo Garcia', 'role' => 'legislative_staff', 'department' => 'SB', 'position' => 'Legislative Records Officer'],
            ['email' => 'employee@talibon.demo', 'name' => 'Ana Flores', 'role' => 'employee', 'department' => 'MPDO', 'position' => 'Administrative Assistant'],
        ];

        foreach ($accounts as $index => $account) {
            $user = User::query()->updateOrCreate(['email' => $account['email']], [
                'name' => $account['name'], 'role' => $account['role'], 'is_active' => true,
                'password' => Hash::make('TalibonDemo2026!'),
            ]);
            Employee::query()->updateOrCreate(['user_id' => $user->id], [
                'employee_number' => sprintf('DEMO-%04d', $index + 1),
                'department_id' => $departments[$account['department']]->id,
                'position_title' => $account['position'],
                'employment_status' => 'active',
            ]);
        }

        $this->call([
            WorkflowDemoSeeder::class,
            MemorandumDemoSeeder::class,
            LegislativeDemoSeeder::class,
        ]);
    }
}
