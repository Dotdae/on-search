import express from "express";
import { sequelize } from "./db.js";
import { Sequelize } from "sequelize";
import { Employee } from "./Employee.model.js";
import morgan from "morgan"
import cors from "cors"

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Conectar a la base de datos y sincronizar modelos
sequelize.sync()
  .then(() => console.log('Conectado a la base de datos y sincronizado'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

// Endpoint de búsquedad.

app.post('/search', async (req, res) => {
    try {
      const query = req.body.query || '';  // Recibe el query del cuerpo de la petición
  
      // Realiza la búsqueda en la base de datos con Sequelize
      const empleados = await Employee.findAll({
        where: {
          nombre: {
            [Sequelize.Op.like]: `%${query}%`,  // Usamos LIKE para búsqueda parcial en Sequelize
          },
        },
      });
  
      // Retorna los empleados encontrados
      res.json(empleados);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      res.status(500).json({ error: 'Hubo un problema con la búsqueda.' });
    }
  });

app.listen(5000, () => console.log('Servidor corriendo en el puerto 3000'));