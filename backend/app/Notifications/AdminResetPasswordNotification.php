<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class AdminResetPasswordNotification extends ResetPassword
{
    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $resetUrl = url('superadmin/admin/reset-password/' . $this->token . '?email=' . urlencode($notifiable->correo));

        return (new MailMessage)
            ->subject('Recuperación de Contraseña - Administrador')
            ->greeting('¡Hola Administrador!')
            ->line('Recibiste este correo porque solicitaste recuperar tu contraseña.')
            ->action('Recuperar Contraseña', $resetUrl)
            ->line('Este enlace de recuperación expirará en 60 minutos.')
            ->line('Si no solicitaste recuperar la contraseña, ignora este correo.')
            ->salutation('Saludos,');
    }
}
