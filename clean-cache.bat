@echo off
title Limpar Cache e Build - Revolution Player
echo ==========================================================
echo Limpando caches e pastas de compilacao do Revolution Player
echo ==========================================================
echo.

echo 1. Removendo cache de build do Rust/Tauri (src-tauri/target)...
if exist "src-tauri\target" (
    rmdir /s /q "src-tauri\target"
    echo [OK] Pasta 'src-tauri/target' deletada.
) else (
    echo [INFO] Pasta 'src-tauri/target' nao existe ou ja foi deletada.
)
echo.

echo 2. Removendo dependencias do frontend (node_modules)...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo [OK] Pasta 'node_modules' deletada.
) else (
    echo [INFO] Pasta 'node_modules' nao existe ou ja foi deletada.
)
echo.

echo 3. Removendo caches de compilacao do Vite (.vite e dist)...
if exist ".vite" (
    rmdir /s /q ".vite"
    echo [OK] Cache '.vite' deletado.
)
if exist "dist" (
    rmdir /s /q "dist"
    echo [OK] Pasta de distribuicao 'dist' deletada.
)
echo.

echo ==========================================================
echo Limpeza concluida! O projeto agora esta ultra leve para zipar/clonar.
echo.
echo DICA: Para rodar novamente a aplicacao, execute:
echo      1. pnpm install   (para reconstruir o node_modules)
echo      2. pnpm tauri dev (para compilar e abrir em desenvolvimento)
echo ==========================================================
pause
