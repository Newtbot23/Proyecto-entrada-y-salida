<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$v = Validator::make(['direccion' => 'Carrera 53 #76-115, Piso 3, Barranquilla, Atlántico'], ['direccion' => 'required|string|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-\#]+$/']);
var_dump($v->passes());
var_dump($v->errors()->toArray());
