const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
require('./routes'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8010;

/*
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------          DEFINIR CONEXIÓN                   ------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
*/

mongoose.connect(global.conection, { // esta definida en la de routes.js de la carpeta express
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.log('Error al conectar a MongoDB:', err);
});

app.use(express.json());
app.use(cors());

// Define the collection and schema for users
const usuarioSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  nombreCompleto: {
    nombres: [String],
    apellidoPaterno: String,
    apellidoMaterno: String,
  },
  correo: String,
  nameUser: String,
  genero: String,
  fechaNacimiento: String,
  peso: String,
  estatura: String,
  contrasena: String,
  photoPerfil: String,
}, { versionKey: false,
});


// Define the collection and schema for registros
const registrosSchema = new mongoose.Schema({
  _id: Number,
  sVital: String,
  fechaDeToma: { type: Date, default: Date.now },
  genero: String,
  nivelRegistrado: {
    maximo: Number,
    minimo: Number,
    promedio: Number
  },
  userName: String,
});

// Define el contador para aumentar numericamente los numeros de usuarios
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 }
});


// generacion de modelos para mongo 
const Counter = mongoose.model('Counter', counterSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Registros = mongoose.model('Registros', registrosSchema);

/*
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------          APIS DE CONEXION                   ------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${global.route}`);
});


/*
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------          APIS DE CONSULTA                   ------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
*/

/** 
 --> Confirma si el usuario existe y así mismo si la contraseña pertenecese al usuario

  CONFIRMA CREDENCIALES

    * @returns {boolean} --> se encontro o no el usuario

    * @param {string} -> (nameUser) Nombre ingresado 
    * @param {string} -> (contrasena) Conraseña ingresada
*/
app.post("/usuarios", async (req, res) => {
  //console.log("Ruta /usuarios accedida");
  //console.log("Parámetros recibidos:", req.body); // <-- Revisar qué llega

  try {
    const { nameUser, contrasena } = req.body;

    if (!nameUser || !contrasena) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    //console.log("Buscando usuario con:", { nameUser, contrasena });

    const usuarios = await Usuario.find({
      nameUser: nameUser,
      contrasena: contrasena,
    });

    if (usuarios.length === 0) {
      console.log("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/**
 --> Obtiene los datos del usuario, en formato json

  * @returns {array} -->[                 EJEMPLO
                          {
                              "_id": #,
                              "correo":"$$$$$",
                              "contrasena":"$$$$",
                              "photoPerfil":"$$$$",
                              "nameUser":"$$$",
                              "genero":"$$$",
                              "nombreCompleto":{
                                  "nombres":["$$$$"],
                                  "apellidoPaterno":"$$$$",
                                  "apellidoMaterno":"$$$$$"
                              },
                              "fechaNacimiento":"$$$$$",
                              "peso":"#",
                              "estatura":"#"
                          }
                          ]
    * @param {string} -> (nameUser) Nombre de usuario 
*/
app.post("/fullUser", async (req, res) => {
  //console.log("Parámetros recibidos:", req.body);

  try {
    const { nameUser } = req.body;

    const usuarios = await Usuario.find({
      nameUser: nameUser
    });

    return res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/** 
 --> Obtiene los datos de registros de un dato en especifico, mismo llegado en el body, en un array de un formato json
* @returns {array} -->[                 EJEMPLO
                        {
                          "_id": 1,
                          "sVital": "Cardiaca",
                          "fechaDeToma": "2025-01-01",
                          "nivelRegistrado": { "maximo": 110, "minimo": 75, "promedio": 83 },
                          "userName": "$$$"
                        },
                        {
                          "_id": 2,
                          "sVital": "Temperatura",
                          "fechaDeToma": "2025-01-02",
                          "nivelRegistrado": { "maximo": 36.4, "minimo": 37.2, "promedio": 36.8 },
                          "userName": "$$$"
                        }
                    ]
    * @param {string} -> (nameUser) Nombre de usuario 
    * @param {string} -> (sVital) Signo vital a tomar
*/
app.post("/registroEspecifico", async (req, res) => {
  //console.log("Ruta /usuarios accedida");
  try {
    const { nameUser, sVital } = req.body;

    const registros = await Registros.find({$and:[{userName: nameUser}, {sVital: sVital}]});

    return res.json(registros);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/**
 --> Trae la ultima incercion de un signo determinado mismo llega especificado en el body

* @returns {array} -->  EJEMPLO:
                        [
                            {
                              "_id": 1,
                              "sVital": "Cardiaca",
                              "fechaDeToma": "2025-01-01",
                              "nivelRegistrado": { "maximo": 110, "minimo": 75, "promedio": 83 },
                              "userName": "$$$"
                            }
                        ]
  * @Param {nameUser} -> Nombre de usuario 
  * @param {string} -> (sVital) Signo vital a tomar

*/
app.post("/registroEspecificoUltimo", async (req, res) => {
  //console.log("Ruta /registroEspecificoUltimo accedida");
  //console.log("Parámetros recibidos:", req.body);

  try {
    const { nameUser, sVital } = req.body;

    const registro = await Registros.findOne(
      { userName: nameUser, sVital: sVital } // Filtrar por usuario y sVital
    )
      .sort({ _id: -1 })
      .limit(1);

    return res.json(registro);
  } catch (err) {
    console.error("Error al obtener el registro:", err);
    res.status(500).json({ message: err.message });
  }
});


/** 
 --> Obtiene los datos de registros en general, en un array de un formato json
* @returns {array} -->[                 EJEMPLO
                        {
                          "_id": 1,
                          "sVital": "Cardiaca",
                          "fechaDeToma": "2025-01-01",
                          "nivelRegistrado": { "maximo": 110, "minimo": 75, "promedio": 83 },
                          "userName": "$$$"
                        },
                        {
                          "_id": 2,
                          "sVital": "Temperatura",
                          "fechaDeToma": "2025-01-02",
                          "nivelRegistrado": { "maximo": 36.4, "minimo": 37.2, "promedio": 36.8 },
                          "userName": "$$$"
                        }
                    ]
    * @param {string} -> (nameUser) Nombre de usuario 
*/
app.post("/registroGeneral", async (req, res) => {
  //console.log("Ruta /usuarios accedida");
  //console.log("Parámetros recibidos:", req.body);

  try {
    const { nameUser } = req.body;

    const registros = await Registros.find({userName: nameUser});

    return res.json(registros);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/** 
 --> Elimina un registro por id de la coleccion de registros

    * @param {Number} -> (_id) id del registro a borrar 
*/
app.delete("/Registro", async (req, res) => {
  //console.log("Ruta /eliminarRegistro accedida");
  //console.log("Parámetros recibidos:", req.body);

  try {
    const { _id } = req.body;

    const resultado = await Registros.deleteOne({ _id: Number(_id) });

    return res.json(resultado);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/** 
 --> Actualiza un registro de usuario por valores definidos

    * @param {string} -> (nameUser) id del registro a borrar 
    * @param {string} -> (key) dato a corregir
    * @param {string} -> (value) nuevo valor a establecer
*/
app.put("/user", async (req, res) => {
  //console.log("Ruta /usuarios accedida");
 // console.log("Parámetros recibidos:", req.body);

  try {
    const { nameUser, key, value } = req.body;

    const usuarios = await Usuario.findOneAndUpdate({nameUser: nameUser}, {$set:{[key]: value}}, {new: true});

    return res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/** 
 --> crea un nuevo registro de usuario

    * @param {string} -> (nombre) 
    * @param {string} -> (apellidoPaterno) 
    * @param {string} -> (apellidoMaterno)
    * @param {string} -> (correo)
    * @param {string} -> (nameUser)
    * @param {string} -> (genero) 
    * @param {string} -> (nameUser)
    * @param {string} -> (fechaNacimiento) 
    * @param {Number} -> (peso) 
    * @param {Number} -> (estatura) 
    * @param {string} -> (contrasena) 
*/
app.post("/user", async (req, res) => {
 // console.log("Ruta /usuarios accedida");
 // console.log("Parámetros recibidos:", req.body);

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'user_id' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    if (!counter) {
      return res.status(500).json({ message: 'No se pudo obtener el contador' });
    }
    const newUserId = counter.value;
    const { nombre, apellidoPaterno, apellidoMaterno, correo, nameUser, genero, 
      fechaNacimiento, peso, estatura, contrasena } = req.body;
    const existingUser = await Usuario.findOne({ _id: newUserId });
    if (existingUser) {
      //console.log(`El ID ${newUserId} ya está en uso. Incrementando el ID...`);
      const updatedCounter = await Counter.findOneAndUpdate(
        { name: 'user_id' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const updatedUserId = updatedCounter.value;
      const newUser = new Usuario({
        _id: updatedUserId, 
        nombreCompleto: {
          nombres: [nombre],
          apellidoPaterno: apellidoPaterno,
          apellidoMaterno: apellidoMaterno
        },
        correo: correo,
        nameUser: nameUser,
        genero: genero,
        fechaNacimiento: fechaNacimiento,
        peso: peso,
        estatura: estatura,
        contrasena: contrasena
      });
      await newUser.save();
      return res.json(newUser);
    }
    const usuarios = await Usuario.insertOne({
      _id: newUserId,
      nombreCompleto: {
        nombres: [nombre],
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno
      },
      correo: correo,
      nameUser: nameUser,
      genero: genero,
      fechaNacimiento: fechaNacimiento,
      peso: peso,
      estatura: estatura,
      contrasena: contrasena,
      photoPerfil: "",
    });
    return res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: err.message });
  }
});


/*
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------          APIS DE ARDUINO                    ------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
*/


/** 
 --> crea un nuevo registro de del historial de registros

    * @param {string} -> (userName)
    * @param {string} -> (sVital) 
    * @param {Number} -> (nivelRegistradoMinimo) 
    * @param {Number} -> (nivelRegistradoMaximo) 
    * @param {Number} -> (nivelRegistradoPromedio) 
*/
app.post("/signoVital", async (req, res) => {
  try {

    const registroMayor = await Registros.findOne().sort({ _id: -1 }); // obtener id maximo registrado
    const { userName, sVital, nivelRegistradoMinimo, nivelRegistradoMaximo, nivelRegistradoPromedio } = req.body; 
    const fechaDeToma = new Date().toISOString().replace("T", " ").slice(0, 19); // obtener fecha del dia 

    /**
    
    * @ejemplo_visual de como verian los tatos en mongodb directamente 
    
    console.log(`
      conexion, el id mayor es ${registroMayor._id}
      "_id":${registroMayor._id + 1}, "sVital": "${sVital}", "fechaDeToma":"${fechaDeToma}", "nivelRegistrado": 
      {"maximo":${nivelRegistradoMaximo}, "minimo": ${nivelRegistradoMinimo}, 
      "promedio":${nivelRegistradoPromedio}}, "userName": "${userName}"
      `)
    */

    // funcion para incertar nuevo registro en la base de datos misma se deposita en una variable para poder imprimirla en consola
    const insercionDeSigno = await Registros.insertOne({
      "_id":registroMayor._id + 1,
      "fechaDeToma": fechaDeToma,
      "nivelRegistrado":{ "maximo": nivelRegistradoMaximo, "minimo": nivelRegistradoMinimo, "promedio": nivelRegistradoPromedio},
      "userName": userName,
      "sVital": sVital
    })
    res.json(insercionDeSigno); // retornamos el nuevo registro para visualizar el json en consola
  } catch (err){
    console.log("fallo en la conexion")
    return "fallo"
  }
})