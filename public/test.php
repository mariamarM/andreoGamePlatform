<?php
$host = '127.0.0.1';
$port = '5432';
$dbname = 'laravel';
$user = 'postgres';
$pass = 'password';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $pass);
    echo "Conexión exitosa!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
