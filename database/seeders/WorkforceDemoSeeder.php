<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WorkforceDemoSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'TalibonDemo2026!';
    private const TARGET_EMPLOYEE_COUNT = 350;

    public function run(): void
    {
        $departments = Department::query()->where('is_active', true)->get()->keyBy('code');

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
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'role' => $account['role'],
                    'is_active' => true,
                    'password' => Hash::make(self::DEMO_PASSWORD),
                ],
            );

            Employee::query()->updateOrCreate(
                ['employee_number' => sprintf('DEMO-%04d', $index + 1)],
                [
                    'full_name' => $account['name'],
                    'work_email' => $account['email'],
                    'user_id' => $user->id,
                    'department_id' => $departments[$account['department']]->id,
                    'position_title' => $account['position'],
                    'employment_status' => 'active',
                    'biometric_external_id' => sprintf('BIO-DEMO-%04d', $index + 1),
                ],
            );
        }

        $firstNames = [
            'Adrian', 'Althea', 'Angela', 'Carlo', 'Catherine', 'Daniel', 'Diana', 'Eduardo', 'Elaine', 'Francis',
            'Grace', 'Jerome', 'Joanna', 'Kristine', 'Luis', 'Marvin', 'Michelle', 'Noel', 'Patricia', 'Ramon',
            'Rhea', 'Roberto', 'Samuel', 'Sheila', 'Therese', 'Vincent', 'Camille', 'Dennis', 'Leah', 'Mark',
        ];
        $lastNames = [
            'Abella', 'Alvarez', 'Bautista', 'Cabahug', 'Canete', 'Castillo', 'Dela Cruz', 'Domingo', 'Fernandez', 'Flores',
            'Garcia', 'Gonzales', 'Lim', 'Lopez', 'Mendoza', 'Navarro', 'Ortega', 'Ramos', 'Reyes', 'Rivera',
            'Santos', 'Torres', 'Villanueva', 'Yap', 'Zamora', 'Baluyot', 'Concepcion', 'Lorenzo', 'Mercado', 'Rosales',
        ];
        $positions = [
            'Administrative Aide',
            'Administrative Assistant',
            'Administrative Officer',
            'Records Officer',
            'Planning Assistant',
            'Project Development Assistant',
            'Technical Assistant',
            'Operations Assistant',
            'Clerk',
            'Office Staff',
        ];

        $departmentList = Department::query()
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN code = 'MAYOR' THEN 0 WHEN code = 'SB' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get();

        $remaining = self::TARGET_EMPLOYEE_COUNT - count($accounts);
        $sealedPrototypePassword = Hash::make(Str::random(64));

        for ($i = 1; $i <= $remaining; $i++) {
            $department = $departmentList[($i - 1) % $departmentList->count()];
            $first = $firstNames[($i - 1) % count($firstNames)];
            $last = $lastNames[(int) floor(($i - 1) / count($firstNames)) % count($lastNames)];
            $position = $positions[($i + $department->id) % count($positions)];
            $name = $first.' '.$last;
            $email = sprintf('%s.%04d@talibon.demo', Str::slug(strtolower($first.'.'.$last), '.'), $i);

            $user = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => 'employee',
                    'is_active' => true,
                    'password' => $sealedPrototypePassword,
                ],
            );

            Employee::query()->updateOrCreate(
                ['employee_number' => sprintf('TAL-EMP-%04d', $i)],
                [
                    'full_name' => $name,
                    'work_email' => $email,
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'position_title' => $position,
                    'employment_status' => 'active',
                    'mobile_number' => null,
                    'biometric_external_id' => sprintf('BIO-%05d', $i),
                ],
            );
        }
    }
}
