<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historial Mensual de Entradas</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
        .header { border-bottom: 2px solid #008f39; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #008f39; margin: 0; font-size: 20px; }
        .info-box { margin-bottom: 20px; background: #f8fafc; padding: 10px; border-radius: 5px; }
        .info-box p { margin: 2px 0; }
        .info-label { font-weight: bold; color: #64748b; width: 120px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #008f39; color: white; padding: 10px; text-align: left; text-transform: uppercase; font-size: 10px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        tr:nth-child(even) { background-color: #f1f5f9; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
        .no-data { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historial Mensual de Entradas y Salidas</h1>
    </div>

    <div class="info-box">
        <p><span class="info-label">Usuario:</span> {{ $user->primer_nombre }} {{ $user->primer_apellido }}</p>
        <p><span class="info-label">Documento:</span> {{ $user->doc }}</p>
        <p><span class="info-label">Periodo:</span> {{ $month }} {{ $year }}</p>
        <p><span class="info-label">Fecha Reporte:</span> {{ date('Y-m-d H:i:s') }}</p>
    </div>

    @if(count($registros) > 0)
    <table>
        <thead>
            <tr>
                <th width="15%">Fecha</th>
                <th width="12%">Entrada</th>
                <th width="12%">Salida</th>
                <th width="30%">Vehículo</th>
                <th width="31%">Equipo</th>
            </tr>
        </thead>
        <tbody>
            @foreach($registros as $reg)
            <tr>
                <td style="font-weight: bold;">{{ $reg->fecha }}</td>
                <td style="color: #166534;">{{ $reg->hora_entrada }}</td>
                <td>{{ $reg->hora_salida ?? 'Sin registro' }}</td>
                <td>
                    @if($reg->placa)
                        {{ $reg->placa }}<br>
                        <small style="color: #64748b;">{{ $reg->vehiculo_marca }} {{ $reg->vehiculo_modelo }}</small>
                    @else
                        -
                    @endif
                </td>
                <td>
                    @if($reg->equipos && count($reg->equipos) > 0)
                        @foreach($reg->equipos as $eq)
                            <div style="margin-bottom: 5px;">
                                {{ $eq->serial }}<br>
                                <small style="color: #64748b;">{{ $eq->marca }} {{ $eq->modelo }}</small>
                            </div>
                        @endforeach
                    @else
                        -
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">
        <p>No se encontraron registros para el periodo seleccionado.</p>
    </div>
    @endif

    <div class="footer">
        Este documento es un reporte oficial del Sistema de Control de Entradas y Salidas.
    </div>
</body>
</html>
