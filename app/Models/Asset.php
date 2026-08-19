<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_number',
        'qr_value',
        'category',
        'description',
        'serial_number',
        'acquisition_date',
        'acquisition_cost',
        'funding_source',
        'supplier',
        'warranty_until',
        'current_department_id',
        'physical_location',
        'accountable_employee_id',
        'par_reference',
        'ics_reference',
        'condition',
        'status',
        'reconciliation_status',
    ];

    protected function casts(): array
    {
        return [
            'acquisition_date' => 'date',
            'warranty_until' => 'date',
            'acquisition_cost' => 'decimal:2',
        ];
    }

    public function currentDepartment(): BelongsTo { return $this->belongsTo(Department::class, 'current_department_id'); }
    public function accountableEmployee(): BelongsTo { return $this->belongsTo(Employee::class, 'accountable_employee_id'); }
    public function assignments(): HasMany { return $this->hasMany(AssetAssignment::class); }
    public function events(): HasMany { return $this->hasMany(AssetEvent::class)->orderBy('created_at'); }
}
