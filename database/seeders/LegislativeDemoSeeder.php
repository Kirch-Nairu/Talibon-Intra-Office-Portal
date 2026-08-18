<?php

namespace Database\Seeders;

use App\Models\LegislativeRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class LegislativeDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (LegislativeRecord::query()->exists()) {
            return;
        }

        $user = User::query()->where('email', 'legislative@talibon.demo')->firstOrFail();
        $records = [
            ['ordinance', 'ORD-2026-014', 'Municipal Solid Waste Segregation and Collection Policy', 'Synthetic ordinance record demonstrating centralized legislative search for waste management policy.', '2026-07-17', 'active', 'solid waste environment segregation collection'],
            ['resolution', 'RES-2026-087', 'Resolution Endorsing Priority Road Rehabilitation Projects', 'Synthetic resolution for infrastructure project endorsement and coordination.', '2026-08-04', 'active', 'road infrastructure rehabilitation engineering'],
            ['ordinance', 'ORD-2025-032', 'Local Disaster Preparedness Coordination Ordinance', 'Synthetic record covering inter-office preparedness and emergency coordination.', '2025-11-21', 'active', 'disaster preparedness emergency coordination'],
            ['resolution', 'RES-2026-066', 'Resolution Supporting Digital Records Modernization', 'Synthetic record used in the prototype legislative repository.', '2026-06-12', 'active', 'digital records modernization government technology'],
            ['executive_order', 'EO-2026-009', 'Inter-Office Records Accountability and Routing Directive', 'Synthetic executive issuance used for prototype demonstration.', '2026-05-08', 'active', 'records routing accountability offices'],
        ];

        foreach ($records as [$type, $number, $title, $summary, $date, $status, $keywords]) {
            LegislativeRecord::query()->create([
                'record_type' => $type,
                'record_number' => $number,
                'title' => $title,
                'summary' => $summary,
                'approved_at' => $date,
                'year' => (int) substr($date, 0, 4),
                'status' => $status,
                'issuing_body' => $type === 'executive_order' ? "Mayor's Office" : 'Sangguniang Bayan',
                'keywords' => $keywords,
                'created_by_user_id' => $user->id,
            ]);
        }
    }
}
