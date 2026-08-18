<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_number',
        'full_name',
        'work_email',
        'user_id',
        'department_id',
        'position_title',
        'employment_status',
        'mobile_number',
        'biometric_external_id',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function department(): BelongsTo { return $this->belongsTo(Department::class); }
    public function leaveCreditAccounts(): HasMany { return $this->hasMany(LeaveCreditAccount::class); }
    public function leaveRequests(): HasMany { return $this->hasMany(LeaveRequest::class); }
    public function attendanceLogs(): HasMany { return $this->hasMany(AttendanceLog::class); }
}
