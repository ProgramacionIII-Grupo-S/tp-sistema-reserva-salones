# API REST - Sistema de Reservas de Salones de Cumpleaños

## 📋 Descripción
API REST desarrollada para la gestión de reservas de salones de cumpleaños para la empresa PROGIII. Este proyecto forma parte del Trabajo Final Integrador de Programación III - UNER.

## 👥 Equipo de Desarrollo
- [Aguilar, Priscila Magali](https://github.com/PriscilaAguilar1214)
- [Aguilar, Yamila Maillen](https://github.com/YamilaAguilar)
- [Gainza, Marcos Gabriel](https://github.com/marcosgainza)
- [Unrein, Yanina Soledad](https://github.com/Yanina-Unrein)

## 🚀 Tecnologías Utilizadas

- Node.js + Express
- MySQL
- JWT (Autenticación)
- Swagger (Documentación)
- express-validator (Validaciones)

## 📁 Estructura del Proyecto   
tp-sistemas-reservas-salones/   
src   
    ├── config/          # Configuración BD   
    ├── controllers/     # Lógica de controladores       
    ├── middleware/      # Middlewares (auth, validación, errores)   
    ├── models/          # Modelos de Sequelize   
    ├── routes/          # Definición de rutas   
    ├── services/        # Lógica de negocio   
    ├── utils/           # Utilidades (constantes, respuestas)   
    └── database/        # Migraciones y seeds      

## 🔧 Variables de Entorno
### Variables requeridas:
Crear archivo .env al mismo nivel que el package.json:

PORT=3000

DB_HOST=localhost   
DB_PORT=tu_puerto (conmunmente 3006)    
DB_USER=tu_user (generalmente puede ser root)   
DB_PASSWORD=tu_password (si no tienes dejalo vacio)   
DB_NAME=reservas   

JWT_SECRET=tu_clave_secreta_jwt_super_larga_y_segura_aqui (usar una clave larga y segura)   
JWT_EXPIRES_IN=1h   

CORREO=tuemail@gmail.com
CLAVE=abcd efgh ijkl mnop   # la clave de 16 caracteres sin espacios




## ⚙️ Scripts Disponibles
```bash
npm i              # Instalar dependencias
npm run dev        # Iniciar con nodemon (index.js ideal mientras programás)
npm start          # Iniciar modo normal
```

## 🗄️ Migración y Configuración de la Base de Datos
El proyecto incluye scripts automatizados para crear la base de datos, sus tablas y los procedimientos almacenados.  
Asegúrate de tener el archivo `.env` correctamente configurado antes de ejecutar cualquiera de estos comandos.

### 📦 Crear y configurar toda la base de datos
Crea la base de datos `reservas`, las tablas y los procedimientos almacenados automáticamente:
```bash
npm run db:setup
```

### 🔍 Verificar estado de la base de datos
Permite comprobar si la conexión funciona correctamente, qué tablas y procedimientos existen:
```bash
npm run db:check
```

### ⚙️ Migrar únicamente los procedimientos almacenados
Ejecuta o actualiza solo los stored procedures sin tocar las tablas existentes:
```bash
npm run db:procedures
```

## 📖 Documentación de la API

Cuando Swagger esté configurado, la documentación será accesible en:
👉 http://localhost:3000/api-docs
