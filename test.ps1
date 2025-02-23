# Tạo thư mục gốc cho dự án
New-Item -ItemType Directory -Path "backend" -Force
Set-Location -Path "backend"

# Tạo thư mục cấu hình
New-Item -ItemType Directory -Path "config" -Force

# Tạo thư mục chứa mã nguồn chính và các module con
New-Item -ItemType Directory -Path "src/controllers" -Force
New-Item -ItemType Directory -Path "src/models" -Force
New-Item -ItemType Directory -Path "src/routes" -Force
New-Item -ItemType Directory -Path "src/middlewares" -Force
New-Item -ItemType Directory -Path "src/services" -Force
New-Item -ItemType Directory -Path "src/utils" -Force

# Tạo thư mục kiểm thử
New-Item -ItemType Directory -Path "tests" -Force

# Tạo các file mẫu
New-Item -ItemType File -Path "config/config.js" -Force | Out-Null
New-Item -ItemType File -Path "config/database.js" -Force | Out-Null
New-Item -ItemType File -Path "src/controllers/userController.js" -Force | Out-Null
New-Item -ItemType File -Path "src/models/user.js" -Force | Out-Null
New-Item -ItemType File -Path "src/routes/userRoutes.js" -Force | Out-Null
New-Item -ItemType File -Path "src/middlewares/auth.js" -Force | Out-Null
New-Item -ItemType File -Path "src/services/userService.js" -Force | Out-Null
New-Item -ItemType File -Path "src/utils/logger.js" -Force | Out-Null
New-Item -ItemType File -Path "tests/user.test.js" -Force | Out-Null

# Tạo các file gốc của dự án
New-Item -ItemType File -Path ".env" -Force | Out-Null
New-Item -ItemType File -Path ".gitignore" -Force | Out-Null
New-Item -ItemType File -Path "server.js" -Force | Out-Null

# Khởi tạo file package.json với các giá trị mặc định
npm init -y

Write-Host "Cấu trúc dự án đã được tạo trong thư mục 'project/'."
