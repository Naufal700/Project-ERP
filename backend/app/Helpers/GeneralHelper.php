<?php

namespace App\Helpers;

class GeneralHelper
{
    public static function generateKodeJurnal($kodeTransaksi)
    {
        return 'JU-' . strtoupper($kodeTransaksi) . '-' . date('Ymd');
    }
}
