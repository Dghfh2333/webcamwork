<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$body = file_get_contents('php://input');
$data = json_decode($body, true) ?: [];
if (($data['lead_type'] ?? '') === 'tg_click') {
    $data['secret'] = 'wm_crm_2026';
    $ch = curl_init('https://script.google.com/macros/s/AKfycbwaNm-CCjJyAxbYNPoFmf1wrP3of5pVjT-7IDoLEE-B7RotPOWqeGSUeBya9NjAr3uhyA/exec');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    echo $resp ?: '{"ok":true}';
    exit;
}
$ch = curl_init('https://leads.webcam-studio.com.ua/lead');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 10,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
http_response_code($code ?: 200);
echo $resp ?: '{"ok":true}';
