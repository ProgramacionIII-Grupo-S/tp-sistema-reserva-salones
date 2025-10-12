# API REST - Sistema de Reservas de Salones de Cumpleaños

## 📋 Descripción
API REST desarrollada para la gestión de reservas de salones de cumpleaños para la empresa PROGIII. Este proyecto forma parte del Trabajo Final Integrador de Programación III - UNER.

## 👥 Equipo de Desarrollo
- [Aguilar, Priscila Magali](https://github.com/PriscilaAguilar1214)
- [Aguilar, Yamila Maillen](https://github.com/YamilaAguilar)
- [Blanc, Eugenia](https://github.com/eugenialite)
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


## ⚙️ Scripts Disponibles
```bash
npm i              # Instalar dependencias
npm run dev        # Iniciar con nodemon (index.js ideal mientras programás)
npm start          # Iniciar modo normal
```

## 📖 Documentación de la API

Cuando Swagger esté configurado, la documentación será accesible en:
👉 http://localhost:3000/api-docs
