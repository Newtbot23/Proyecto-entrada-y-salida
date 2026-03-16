<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class NotRecentPassword implements ValidationRule
{
    /**
     * El documento del usuario (PK de la tabla usuarios).
     */
    protected int|string $usuario_doc;

    /**
     * El hash de la contraseña ACTUAL del usuario.
     * Se compara para impedir que se reutilice sin esperar a la
     * siguiente actualización (antes de que el trigger la archive).
     */
    protected ?string $currentPasswordHash;

    /**
     * Crea una nueva instancia de la regla.
     *
     * @param  int|string  $usuario_doc         PK del usuario (campo `doc`)
     * @param  string|null $currentPasswordHash Hash de la contraseña vigente
     */
    public function __construct(int|string $usuario_doc, ?string $currentPasswordHash = null)
    {
        $this->usuario_doc         = $usuario_doc;
        $this->currentPasswordHash = $currentPasswordHash;
    }

    /**
     * Ejecuta la regla de validación.
     *
     * @param  string   $attribute  Nombre del atributo validado
     * @param  mixed    $value      Contraseña en texto plano ingresada por el usuario
     * @param  Closure  $fail       Callback para fallar la validación con un mensaje
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Verificar contra la contraseña actual (aún no archivada por el trigger)
        if ($this->currentPasswordHash && Hash::check($value, $this->currentPasswordHash)) {
            $fail($this->message());
            return;
        }

        // 2. Verificar contra las últimas 5 contraseñas archivadas en el historial
        $recentPasswords = DB::table('old_passwords')
            ->where('usuario_doc', $this->usuario_doc)
            ->latest('created_at')
            ->take(5)
            ->get();

        foreach ($recentPasswords as $old) {
            if (Hash::check($value, $old->password)) {
                $fail($this->message());
                return;
            }
        }
    }

    /**
     * Mensaje de error cuando la validación falla.
     */
    public function message(): string
    {
        return 'Por razones de seguridad, no puedes utilizar ninguna de tus últimas 5 contraseñas, ni tu contraseña actual.';
    }
}
