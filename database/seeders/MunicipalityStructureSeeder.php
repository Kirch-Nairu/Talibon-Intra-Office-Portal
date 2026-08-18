<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class MunicipalityStructureSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['code' => 'MAYOR', 'name' => "Mayor's Office", 'short_name' => 'Mayor'],
            ['code' => 'ADMIN', 'name' => 'Office of the Municipal Administrator', 'short_name' => 'Administrator'],
            ['code' => 'VICE_MAYOR', 'name' => "Vice Mayor's Office", 'short_name' => 'Vice Mayor'],
            ['code' => 'SB', 'name' => 'Sangguniang Bayan / Legislative Office', 'short_name' => 'Legislative'],
            ['code' => 'SB_SECRETARY', 'name' => 'Office of the Secretary to the Sangguniang Bayan', 'short_name' => 'SB Secretary'],
            ['code' => 'MPDO', 'name' => 'Municipal Planning and Development Office', 'short_name' => 'Planning'],
            ['code' => 'ENG', 'name' => 'Municipal Engineering Office', 'short_name' => 'Engineering'],
            ['code' => 'ZONING', 'name' => 'Zoning Administration Office', 'short_name' => 'Zoning'],
            ['code' => 'BUDGET', 'name' => 'Municipal Budget Office', 'short_name' => 'Budget'],
            ['code' => 'ACCOUNTING', 'name' => 'Municipal Accounting Office', 'short_name' => 'Accounting'],
            ['code' => 'TREASURY', 'name' => 'Municipal Treasury Office', 'short_name' => 'Treasury'],
            ['code' => 'ASSESSOR', 'name' => "Municipal Assessor's Office", 'short_name' => 'Assessor'],
            ['code' => 'INTERNAL_AUDIT', 'name' => 'Internal Audit Service', 'short_name' => 'Internal Audit'],
            ['code' => 'HRMO', 'name' => 'Human Resource Management Office', 'short_name' => 'HRMO'],
            ['code' => 'GSO', 'name' => 'General Services Office', 'short_name' => 'GSO'],
            ['code' => 'CIVIL_REG', 'name' => 'Municipal Civil Registry Office', 'short_name' => 'Civil Registry'],
            ['code' => 'BPLO', 'name' => 'Business Permits and Licensing Office', 'short_name' => 'BPLO'],
            ['code' => 'BAC', 'name' => 'Bids and Awards Committee Secretariat', 'short_name' => 'BAC'],
            ['code' => 'INFO', 'name' => 'Municipal Information Office', 'short_name' => 'Information'],
            ['code' => 'AGRI', 'name' => 'Municipal Agriculture Office', 'short_name' => 'Agriculture'],
            ['code' => 'MSWDO', 'name' => 'Municipal Social Welfare and Development Office', 'short_name' => 'MSWDO'],
            ['code' => 'PESO', 'name' => 'Public Employment Service Office', 'short_name' => 'PESO'],
            ['code' => 'TOURISM', 'name' => 'Municipal Tourism Office', 'short_name' => 'Tourism'],
            ['code' => 'LEDIPO', 'name' => 'Local Economic Development and Investment Promotions Office', 'short_name' => 'LEDIPO'],
            ['code' => 'MENRO', 'name' => 'Municipal Environment and Natural Resources Office', 'short_name' => 'MENRO'],
            ['code' => 'MDRRMO', 'name' => 'Municipal Disaster Risk Reduction and Management Office', 'short_name' => 'MDRRMO'],
            ['code' => 'MARKET', 'name' => 'Municipal Market Office', 'short_name' => 'Market'],
            ['code' => 'TRANSPORT', 'name' => 'Talibon Integrated Transport Terminal Office', 'short_name' => 'Transport'],
            ['code' => 'HEALTH', 'name' => 'Municipal Health Office / Rural Health Unit', 'short_name' => 'Health'],
        ];

        foreach ($departments as $department) {
            Department::query()->updateOrCreate(
                ['code' => $department['code']],
                $department + ['is_active' => true],
            );
        }
    }
}
