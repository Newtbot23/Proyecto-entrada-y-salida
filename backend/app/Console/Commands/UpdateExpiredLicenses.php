<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LicenciasSistema;
use Illuminate\Support\Facades\Log;

class UpdateExpiredLicenses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'licenses:update-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update status of active licenses that have passed their expiration date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting expired licenses check...');
        
        $expiredCount = LicenciasSistema::where('estado', 'activo')
            ->where('fecha_vencimiento', '<', now())
            ->update([
                'estado' => 'expirado',
                'fecha_ultima_validacion' => now()
            ]);

        $msg = "Checked licenses. Expired $expiredCount licenses.";
        $this->info($msg);
        Log::info($msg);
        
        return 0;
    }
}
