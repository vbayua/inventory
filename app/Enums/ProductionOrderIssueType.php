<?php

namespace App\Enums;

enum ProductionOrderIssueType: string
{
    case Issue = 'issue';
    case Return = 'return';
    case WriteOff = 'write_off';
}
