<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $licenses = \App\Models\LicenciasSistema::with(['plan', 'entidad'])->get();
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.licenses', compact('licenses'));
    $output = $pdf->output();
    echo "PDF generated successfully, size: " . strlen($output) . " bytes\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
