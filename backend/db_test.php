<?php
$hosts = ['127.0.0.1', 'localhost'];
$users = ['root', 'pma'];
$db   = 'laravel';
$pass = '';

foreach ($hosts as $host) {
    foreach ($users as $user) {
        echo "--- Testing connection to $host with user $user ---\n";
        
        // Test PDO
        try {
            $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            echo "PDO success: $host, $user\n";
        } catch (\PDOException $e) {
            echo "PDO fail: " . $e->getMessage() . "\n";
        }

        // Test mysqli
        $mysqli = @new mysqli($host, $user, $pass, $db);
        if ($mysqli->connect_error) {
            echo "mysqli fail: " . $mysqli->connect_error . "\n";
        } else {
            echo "mysqli success: $host, $user\n";
            $mysqli->close();
        }
    }
}
?>
