CREATE DATABASE Wondertrip;
USE Wondertrip;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    imagen_perfil TEXT 
);

CREATE TABLE hoteles (
    id_hotel INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen_principal TEXT
   
);

CREATE TABLE sitios_turisticos (
    id_sitio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    ubicacion VARCHAR(150),
    imagen_principal TEXT NOT NULL,
    id_hotel INT,
    FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel)
);

CREATE TABLE eventos (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    imagen_cartel TEXT, 
    fecha_inicio DATE,
    fecha_fin DATE,
    id_sitio INT,
    FOREIGN KEY (id_sitio) REFERENCES sitios_turisticos(id_sitio)
);

CREATE TABLE tours (
    id_tour INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    imagen_portada TEXT, 
    duracion INT,
    precio DECIMAL(10,2),
    id_sitio INT,
    FOREIGN KEY (id_sitio) REFERENCES sitios_turisticos(id_sitio)
);

CREATE TABLE reportes (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE paquetes (
    id_paquete INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE paquete_sitios (
    id_paquete INT NOT NULL,
    id_sitio INT NOT NULL,
    PRIMARY KEY (id_paquete, id_sitio),
    FOREIGN KEY (id_paquete) REFERENCES paquetes(id_paquete),
    FOREIGN KEY (id_sitio) REFERENCES sitios_turisticos(id_sitio)
);

CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    fecha_compra DATE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    usuario_id INT NOT NULL,
    paquete_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id_paquete)
);


INSERT INTO usuarios (nombre, sexo, correo, contrasena, rol, imagen_perfil) VALUES
('Juan Pérez', 'Masculino', 'juan@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'),
('María García', 'Femenino', 'maria@email.com', 'pass123', 'ADMINISTRADOR', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'),
('Carlos López', 'Masculino', 'carlos@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e'),
('Ana Martínez', 'Femenino', 'ana@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'),
('Pedro Sánchez', 'Masculino', 'pedro@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1552058544-f2b08422138a'),
('Laura Rodríguez', 'Femenino', 'laura@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1554151228-14d9def656e4'),
('Miguel Torres', 'Masculino', 'miguel@email.com', 'pass123', 'ADMINISTRADOR', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'),
('Sofía Herrera', 'Femenino', 'sofia@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'),
('Jorge Ramírez', 'Masculino', 'jorge@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'),
('Elena Castro', 'Femenino', 'elena@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1517841905240-472988babdf9'),
('Ricardo Mendez', 'Masculino', 'ricardo@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'),
('Diana Flores', 'Femenino', 'diana@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce'),
('Fernando Ruiz', 'Masculino', 'fernando@email.com', 'pass123', 'ADMINISTRADOR', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef'),
('Patricia Vargas', 'Femenino', 'patricia@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f'),
('Roberto Navarro', 'Masculino', 'roberto@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1542178243-bc20204b769f'),
('Gabriela Ortega', 'Femenino', 'gabriela@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'),
('Oscar Silva', 'Masculino', 'oscar@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857'),
('Claudia Rios', 'Femenino', 'claudia@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e'),
('Hugo Morales', 'Masculino', 'hugo@email.com', 'pass123', 'ADMINISTRADOR', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5'),
('Lucía Guzmán', 'Femenino', 'lucia@email.com', 'pass123', 'USUARIO', 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21');

INSERT INTO hoteles (nombre, direccion, descripcion, imagen_principal) VALUES
('Grand Paradise', 'Av. Costera 500, Acapulco', 'Lujoso hotel frente al mar con albercas infinitas', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'),
('Mountain Lodge', 'Carretera a la Montaña km 12, Chiapas', 'Cabañas de lujo en medio del bosque', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
('Urban Suites', 'Reforma 222, CDMX', 'Hotel boutique en el corazón financiero', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791'),
('Beach Palace', 'Blvd. Kukulcán km 12, Cancún', 'Todo incluido con playa privada', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'),
('Desert Oasis', 'Carretera a Sonora km 45, Sonora', 'Spa y relajación en medio del desierto', 'https://images.unsplash.com/photo-1535827841776-24af3a0573d3'),
('Historic Plaza', 'Calle 60 #456, Mérida', 'Antigua casona colonial convertida en hotel', 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8'),
('Jungle Retreat', 'Selva Lacandona km 8, Chiapas', 'Ecolodge con tours de aventura incluidos', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
('Wine Country Inn', 'Ruta del Vino km 5, Ensenada', 'Hotel temático del vino con catas diarias', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791'),
('Business Tower', 'Av. Revolución 1000, Monterrey', 'Hotel ejecutivo con centro de convenciones', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'),
('Hacienda Real', 'Carr. a Querétaro km 10, Guanajuato', 'Antigua hacienda restaurada con lujo moderno', 'https://images.unsplash.com/photo-1535827841776-24af3a0573d3'),
('Surf Camp', 'Playa Zicatela s/n, Puerto Escondido', 'Hotel para surfistas con escuela incluida', 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8'),
('Golf Resort', 'Campo de Golf 1, Los Cabos', 'Resort con campo de golf profesional', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
('Boutique Colonial', 'Callejón del Beso 15, Guanajuato', 'Pequeño hotel temático en edificio histórico', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791'),
('Family Club', 'Blvd. Turístico 300, Mazatlán', 'Complejo con parque acuático y actividades infantiles', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'),
('Wellness Haven', 'Valle de Bravo km 3, Estado de México', 'Centro de bienestar con programas detox', 'https://images.unsplash.com/photo-1535827841776-24af3a0573d3'),
('Art Deco Hotel', 'Av. Juárez 250, Guadalajara', 'Edificio art deco con galería de arte incluida', 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8'),
('Adventure Base', 'Barrancas del Cobre, Chihuahua', 'Campamento base para excursiones extremas', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
('Luxury Yacht Hotel', 'Marina Vallarta 15, Puerto Vallarta', 'Habitaciones en yates de lujo anclados', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791'),
('Pyramid View', 'Calz. de los Muertos s/n, Teotihuacán', 'Vistas directas a las pirámides desde las habitaciones', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'),
('Cenote Hideaway', 'Carretera Tulum-Cobá km 7, Quintana Roo', 'Habitaciones sobre un cenote privado', 'https://images.unsplash.com/photo-1535827841776-24af3a0573d3');


INSERT INTO sitios_turisticos (nombre, descripcion, ubicacion, imagen_principal, id_hotel) VALUES
('Playa Condesa', 'Hermosa playa de arena blanca ideal para surf', 'Acapulco, Guerrero', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6', 1),
('Cañón del Sumidero', 'Impresionante cañón con paredes de hasta 1000m', 'Chiapas', 'https://images.unsplash.com/photo-1571974096035-bc3568627606', 2),
('Torre Latinoamericana', 'Mirador con vistas panorámicas de la CDMX', 'Centro Histórico, CDMX', 'https://images.unsplash.com/photo-1518632617565-f0c4261c44d0', 3),
('Chichén Itzá', 'Famosa pirámide maya declarada maravilla del mundo', 'Yucatán', 'https://images.unsplash.com/photo-1525873020571-08690094e301', 4),
('Desierto de Altar', 'Único lugar en Norteamérica con dunas móviles', 'Sonora', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35', 5),
('Cenote Ik Kil', 'Cenote sagrado maya perfecto para nadar', 'Yucatán', 'https://images.unsplash.com/photo-1552819405-1c51d34d3d4d', 6),
('Palenque', 'Ruinas mayas en medio de la selva', 'Chiapas', 'https://images.unsplash.com/photo-1621451537084-482c73073a0f', 7),
('Valle de Guadalupe', 'Principal región vinícola de México', 'Baja California', 'https://images.unsplash.com/photo-1601589880799-8ebddb004c0a', 8),
('Grutas de García', 'Cuevas con formaciones rocosas milenarias', 'Nuevo León', 'https://images.unsplash.com/photo-1583235366115-9a0f652799c0', 9),
('Museo Subacuático', 'Arte contemporáneo bajo el mar', 'Cancún, Quintana Roo', 'https://images.unsplash.com/photo-1579033462043-0f11a7862f7d', 10),
('Playa Zicatela', 'Famosa por sus olas perfectas para surf', 'Oaxaca', 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a', 11),
('El Arco', 'Icono natural de Los Cabos', 'Baja California Sur', 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 12),
('Mina La Valenciana', 'Antigua mina de plata con capilla barroca', 'Guanajuato', 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', 13),
('Malecón de Mazatlán', 'Paseo costero con monumentos y vistas al mar', 'Sinaloa', 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', 14),
('Cascada Velo de Novia', 'Salto de agua de 35m en medio del bosque', 'Estado de México', 'https://images.unsplash.com/photo-1511497584788-876760111969', 15),
('Mercado San Juan de Dios', 'Mercado artesanal más grande de Latinoamérica', 'Guadalajara', 'https://images.unsplash.com/photo-1580913428735-bd3c269d6a82', 16),
('Barrancas del Cobre', 'Más grandes y profundas que el Gran Cañón', 'Chihuahua', 'https://images.unsplash.com/photo-1571974096035-bc3568627606', 17),
('Islas Marietas', 'Reserva natural con playa escondida', 'Nayarit', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6', 18),
('Pirámide del Sol', 'Estructura prehispánica más grande de Teotihuacán', 'Estado de México', 'https://images.unsplash.com/photo-1525873020571-08690094e301', 19),
('Gran Cenote', 'Sistema de cuevas submarinas para esnorquelear', 'Quintana Roo', 'https://images.unsplash.com/photo-1552819405-1c51d34d3d4d', 20);

INSERT INTO eventos (titulo, descripcion, imagen_cartel, fecha_inicio, fecha_fin, id_sitio) VALUES
('Festival del Sol', 'Celebración del solsticio de verano', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', '2023-06-21', '2023-06-24', 1),
('Noche de Museos', 'Evento cultural con acceso gratuito', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', '2023-07-15', '2023-07-15', 3),
('Feria del Vino', 'Degustación de vinos locales', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', '2023-08-10', '2023-08-15', 8),
('Torneo de Surf', 'Competencia internacional de surf', 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a', '2023-09-05', '2023-09-10', 11),
('Eclipse Lunar', 'Observación astronómica guiada', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', '2023-10-28', '2023-10-28', 15),
('Festival Cervantino', 'Evento internacional de arte y cultura', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', '2023-10-12', '2023-10-30', 13),
('Día de Muertos', 'Celebración tradicional mexicana', 'https://images.unsplash.com/photo-1576086213369-97a306d36557', '2023-11-01', '2023-11-02', 6),
('Feria del Libro', 'Presentaciones y venta de libros', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', '2023-11-20', '2023-11-27', 16),
('Navidad en la Playa', 'Evento navideño con fuegos artificiales', 'https://images.unsplash.com/photo-1513151233558-d860c5398176', '2023-12-24', '2023-12-25', 4),
('Año Nuevo Maya', 'Ceremonia tradicional de renovación', 'https://images.unsplash.com/photo-1525873020571-08690094e301', '2024-03-21', '2024-03-21', 4),
('Festival de Jazz', 'Conciertos al aire libre', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', '2023-05-15', '2023-05-20', 2),
('Expo Artesanal', 'Venta de artesanías tradicionales', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae', '2023-06-10', '2023-06-18', 7),
('Maratón Internacional', 'Carrera con ruta panorámica', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', '2023-07-22', '2023-07-22', 14),
('Feria Gastronómica', 'Muestra de cocina regional', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', '2023-08-05', '2023-08-12', 9),
('Festival de Globos', 'Espectáculo de globos aerostáticos', 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7', '2023-09-16', '2023-09-17', 5),
('Noche de las Estrellas', 'Observación astronómica masiva', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', '2023-10-21', '2023-10-21', 17),
('Feria del Tequila', 'Exposición de destilados mexicanos', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', '2023-11-10', '2023-11-15', 12),
('Festival de Cine', 'Proyecciones al aire libre', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c', '2023-12-01', '2023-12-10', 18),
('Carnaval', 'Desfiles y fiestas tradicionales', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', '2024-02-10', '2024-02-15', 19),
('Semana Santa', 'Procesiones y eventos religiosos', 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81', '2024-04-05', '2024-04-10', 20);


INSERT INTO tours (nombre, descripcion, imagen_portada, duracion, precio, id_sitio) VALUES
('Tour Acapulco Clásico', 'Recorrido por los principales atractivos', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6', 4, 650.00, 1),
('Aventura en Cañón', 'Paseo en lancha por el cañón', 'https://images.unsplash.com/photo-1571974096035-bc3568627606', 6, 850.00, 2),
('CDMX Histórica', 'Visita a los monumentos más importantes', 'https://images.unsplash.com/photo-1518632617565-f0c4261c44d0', 8, 750.00, 3),
('Mundo Maya', 'Tour arqueológico por Chichén Itzá', 'https://images.unsplash.com/photo-1525873020571-08690094e301', 10, 1200.00, 4),
('Desierto Extremo', 'Paseo en cuatrimoto por las dunas', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35', 5, 950.00, 5),
('Cenotes Sagrados', 'Visita a 3 cenotes diferentes', 'https://images.unsplash.com/photo-1552819405-1c51d34d3d4d', 7, 800.00, 6),
('Selva y Ruinas', 'Combinación de naturaleza y arqueología', 'https://images.unsplash.com/photo-1621451537084-482c73073a0f', 8, 900.00, 7),
('Ruta del Vino', 'Visita a 4 viñedos con degustación', 'https://images.unsplash.com/photo-1601589880799-8ebddb004c0a', 6, 1100.00, 8),
('Grutas Misteriosas', 'Exploración de cuevas con guía', 'https://images.unsplash.com/photo-1583235366115-9a0f652799c0', 4, 700.00, 9),
('Arte Subacuático', 'Snorkel en el museo bajo el mar', 'https://images.unsplash.com/photo-1579033462043-0f11a7862f7d', 3, 600.00, 10),
('Surf Experience', 'Clases con instructores profesionales', 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a', 5, 850.00, 11),
('Tour Cabo VIP', 'Paseo en yate con avistamiento de ballenas', 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 4, 1500.00, 12),
('Minas de Plata', 'Recorrido histórico por las minas', 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', 5, 650.00, 13),
('Mazatlán Cultural', 'Visita a museos y monumentos', 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', 6, 700.00, 14),
('Cascadas Mágicas', 'Senderismo y natación en cascadas', 'https://images.unsplash.com/photo-1511497584788-876760111969', 7, 750.00, 15),
('Artesanías Tapatías', 'Talleres con artesanos locales', 'https://images.unsplash.com/photo-1580913428735-bd3c269d6a82', 4, 600.00, 16),
('Tren del Cobre', 'Viaje panorámico por las barrancas', 'https://images.unsplash.com/photo-1571974096035-bc3568627606', 8, 1300.00, 17),
('Islas Paradisíacas', 'Excursión en barco a las islas', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6', 5, 950.00, 18),
('Teotihuacán VIP', 'Recorrido con arqueólogo especializado', 'https://images.unsplash.com/photo-1525873020571-08690094e301', 6, 850.00, 19),
('Cenotes Secretos', 'Exploración de cenotes poco conocidos', 'https://images.unsplash.com/photo-1552819405-1c51d34d3d4d', 7, 900.00, 20);

INSERT INTO reportes (titulo, descripcion, fecha, id_usuario) VALUES
('Problema con reservación', 'No aparece mi reservación confirmada', '2023-01-15', 1),
('Sugerencia de mejora', 'Faltan más opciones vegetarianas en el menú', '2023-02-20', 3),
('Felicitaciones al personal', 'Excelente servicio en recepción', '2023-03-10', 5),
('Incidente en alberca', 'Area de alberca sin supervisión', '2023-04-05', 7),
('Problema con WiFi', 'La señal es muy débil en las habitaciones', '2023-05-12', 9),
('Queja sobre limpieza', 'La habitación no estaba bien limpiada', '2023-06-18', 11),
('Recomendación de tour', 'El guía fue muy conocedor', '2023-07-22', 13),
('Problema con factura', 'Error en el cobro de servicios', '2023-08-30', 15),
('Solicitud de información', 'Necesito datos para facturación', '2023-09-05', 17),
('Reporte de objeto perdido', 'Olvidé mi cámara en la habitación 302', '2023-10-10', 19),
('Felicitaciones por evento', 'El festival de jazz fue excelente', '2023-01-25', 2),
('Problema con transporte', 'El shuttle no llegó a tiempo', '2023-02-15', 4),
('Sugerencia de menú', 'Más variedad en desayunos', '2023-03-20', 6),
('Queja sobre ruido', 'Mucho ruido en habitaciones contiguas', '2023-04-12', 8),
('Reconocimiento a chef', 'La comida fue excepcional', '2023-05-18', 10),
('Problema con aire acondicionado', 'No funcionaba correctamente', '2023-06-22', 12),
('Solicitud de tour especial', 'Necesito tour accesible', '2023-07-30', 14),
('Reporte de seguridad', 'Puerta de emergencia bloqueada', '2023-08-15', 16),
('Felicitaciones por spa', 'Masajes relajantes de primera', '2023-09-20', 18),
('Problema con reserva de tour', 'No se aplicó descuento promocional', '2023-10-05', 20);

INSERT INTO paquetes (nombre, descripcion, precio) VALUES
('Aventura Extrema', 'Tours de aventura para amantes de la emoción', 3500.00),
('Cultura Maya', 'Experiencia arqueológica completa', 4200.00),
('Relax Total', 'Spa, masajes y tratamientos de bienestar', 3800.00),
('Gournición', 'Paquete romántico para parejas', 4500.00),
('Familiar', 'Actividades para toda la familia', 3200.00),
('Gourmet', 'Experiencias culinarias y degustaciones', 4000.00),
('Playas VIP', 'Lujo en las mejores playas de México', 5000.00),
('Ciudades Coloniales', 'Recorrido por el patrimonio histórico', 3700.00),
('Naturaleza Viva', 'Ecoturismo y contacto con la naturaleza', 3600.00),
('Luna de Miel', 'Experiencia premium para recién casados', 5200.00),
('Senior', 'Actividades diseñadas para adultos mayores', 3000.00),
('Soltero', 'Diversión y fiesta en destinos playeros', 4800.00),
('Fotográfico', 'Lugares instagrameables con guía fotógrafo', 3900.00),
('Místico', 'Temazcal, ceremonias y experiencias espirituales', 4100.00),
('Deportivo', 'Para amantes del golf, surf y deportes extremos', 4300.00),
('Arte y Cultura', 'Visitas a museos y talleres artísticos', 3400.00),
('Tequila Experience', 'Recorrido por haciendas tequileras', 3800.00),
('Aves Exóticas', 'Avistamiento de aves en reservas naturales', 3500.00),
('Historia Viva', 'Recorrido con historiadores especializados', 3700.00),
('Premium Todo Incluido', 'Servicios de lujo sin limitaciones', 6000.00);

INSERT INTO paquete_sitios (id_paquete, id_sitio) VALUES
(1, 2), (1, 5), (1, 17),
(2, 4), (2, 6), (2, 7),
(3, 15), (3, 19),
(4, 1), (4, 4), (4, 10),
(5, 3), (5, 14), (5, 16),
(6, 8), (6, 12), (6, 17),
(7, 1), (7, 4), (7, 11), (7, 18),
(8, 3), (8, 13), (8, 19),
(9, 2), (9, 7), (9, 15), (9, 20),
(10, 4), (10, 10), (10, 18),
(11, 3), (11, 9), (11, 14),
(12, 1), (12, 4), (12, 11),
(13, 4), (13, 6), (13, 10), (13, 19),
(14, 4), (14, 7), (14, 20),
(15, 1), (15, 11), (15, 12),
(16, 3), (16, 13), (16, 16),
(17, 8), (17, 12),
(18, 2), (18, 7), (18, 15),
(19, 4), (19, 7), (19, 13), (19, 19),
(20, 1), (20, 4), (20, 10), (20, 12), (20, 18);

INSERT INTO compras (fecha_compra, metodo_pago, usuario_id, paquete_id) VALUES
('2023-01-10', 'TARJETA', 1, 5),
('2023-01-15', 'TARJETA', 3, 2),
('2023-02-05', 'TARJETA', 5, 7),
('2023-02-20', 'TARJETA', 7, 1),
('2023-03-12', 'TARJETA', 9, 10),
('2023-03-25', 'TRANSFERENCIA', 11, 3),
('2023-04-05', 'TRANSFERENCIA', 13, 8),
('2023-04-18', 'TRANSFERENCIA', 15, 4),
('2023-05-01', 'TRANSFERENCIA', 17, 6),
('2023-05-15', 'TRANSFERENCIA', 19, 9),
('2023-06-02', 'TRANSFERENCIA', 2, 12),
('2023-06-20', 'TRANSFERENCIA', 4, 15),
('2023-07-08', 'TRANSFERENCIA', 6, 11),
('2023-07-22', 'EFECTIVO', 8, 14),
('2023-08-10', 'EFECTIVO', 10, 16),
('2023-08-25', 'EFECTIVO', 12, 13),
('2023-09-05', 'EFECTIVO', 14, 17),
('2023-09-18', 'EFECTIVO', 16, 19),
('2023-10-03', 'EFECTIVO', 18, 18),
('2023-10-20', 'EFECTIVO', 20, 20);