<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Entidades y Licencias</title>
</head>
<body>
	<div>
		<h1>Entidades y Licencias</h1>
		
		<div style="margin-bottom: 20px; display: flex; gap: 20px;">
			<div style="border: 1px solid #ccc; padding: 15px; width: 200px;">
				<p>Instituciones activas</p>
				<p style="font-size: 24px; font-weight: bold;">{{ $institucionesActivas }}</p>
			</div>
			<div style="border: 1px solid #ccc; padding: 15px; width: 200px;">
				<p>Licencias apunto de expirar</p>
				<p style="font-size: 24px; font-weight: bold;">{{ $licenciasProximasAVencer }}</p>
			</div>
		</div>
		
		@include('superadmin.entidades_table')
	</div>
</body>
</html>
