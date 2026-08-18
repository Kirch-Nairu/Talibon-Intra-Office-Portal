<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowTransaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    protected $fillable = [
        'reference_no',
        'transaction_type',
        'title',
        'description',
        'priority',
        'origin_department_id',
        'current_department_id',
        'created_by_user_id',
        'assigned_to_user_id',
        'status',
        'closed_at',
    ];

    protected function casts(): array
    {
        return ['closed_at' => 'datetime'];
    }

    public function originDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'origin_department_id');
    }

    public function currentDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'current_department_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(TransactionEvent::class, 'transaction_id')->orderBy('created_at');
    }
}
