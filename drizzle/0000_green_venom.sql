CREATE TABLE `aviso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presupuesto_id` integer,
	`texto` text NOT NULL,
	`leido` integer DEFAULT false NOT NULL,
	`ts` integer NOT NULL,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `aviso_leido` ON `aviso` (`leido`);--> statement-breakpoint
CREATE INDEX `aviso_ts` ON `aviso` (`ts`);--> statement-breakpoint
CREATE TABLE `cliente` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text,
	`email` text,
	`notas` text,
	`creado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evento` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presupuesto_id` integer,
	`tipo` text NOT NULL,
	`meta` text DEFAULT '{}' NOT NULL,
	`ts` integer NOT NULL,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evento_presupuesto` ON `evento` (`presupuesto_id`);--> statement-breakpoint
CREATE INDEX `evento_ts` ON `evento` (`ts`);--> statement-breakpoint
CREATE TABLE `evento_lectura` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presupuesto_id` integer NOT NULL,
	`visitante_id` text NOT NULL,
	`visita_n` integer DEFAULT 1 NOT NULL,
	`seccion` text,
	`duracion_s` integer,
	`ip` text,
	`ciudad` text,
	`pais` text,
	`dispositivo` text,
	`ts` integer NOT NULL,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lectura_presupuesto` ON `evento_lectura` (`presupuesto_id`);--> statement-breakpoint
CREATE INDEX `lectura_ts` ON `evento_lectura` (`ts`);--> statement-breakpoint
CREATE TABLE `linea` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presupuesto_id` integer NOT NULL,
	`partida_id` integer,
	`capitulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`unidad` text NOT NULL,
	`medicion` real DEFAULT 0 NOT NULL,
	`precio` integer DEFAULT 0 NOT NULL,
	`precio_manual` integer DEFAULT false NOT NULL,
	`margen_pct` real DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`confianza` real,
	`amarilla` integer DEFAULT false NOT NULL,
	`opcional` integer DEFAULT false NOT NULL,
	`elegida` integer DEFAULT true NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`motivo_ia` text,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`partida_id`) REFERENCES `partida`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `linea_presupuesto` ON `linea` (`presupuesto_id`);--> statement-breakpoint
CREATE TABLE `negocio` (
	`id` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`cif` text NOT NULL,
	`direccion` text NOT NULL,
	`telefono` text NOT NULL,
	`email` text NOT NULL,
	`color_marca` text NOT NULL,
	`iva_pct` real NOT NULL,
	`condiciones` text NOT NULL,
	`seguimiento_1` text NOT NULL,
	`seguimiento_2` text NOT NULL,
	`seguimiento_3` text NOT NULL,
	`caducidad_dias` integer NOT NULL,
	`fecha_alta` integer NOT NULL,
	`reloj_offset_ms` integer DEFAULT 0 NOT NULL,
	`datos_ejemplo` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `partida` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`capitulo` text NOT NULL,
	`nombre` text NOT NULL,
	`unidad` text NOT NULL,
	`precio` integer NOT NULL,
	`margen_objetivo` real NOT NULL,
	`activa` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `partida_codigo` ON `partida` (`codigo`);--> statement-breakpoint
CREATE INDEX `partida_capitulo` ON `partida` (`capitulo`);--> statement-breakpoint
CREATE TABLE `peticion_web` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`motivo` text NOT NULL,
	`ts` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `peticion_ip` ON `peticion_web` (`ip`,`motivo`,`ts`);--> statement-breakpoint
CREATE TABLE `plantilla` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text NOT NULL,
	`lineas` text NOT NULL,
	`creado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `presupuesto` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero` text NOT NULL,
	`token` text NOT NULL,
	`cliente_id` integer NOT NULL,
	`direccion_obra` text NOT NULL,
	`titulo` text NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`iva_pct` real NOT NULL,
	`descuento_pct` real DEFAULT 0 NOT NULL,
	`base` integer DEFAULT 0 NOT NULL,
	`iva_importe` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`coste` integer DEFAULT 0 NOT NULL,
	`margen_pct` real DEFAULT 0 NOT NULL,
	`caducidad_dias` integer NOT NULL,
	`valido_hasta` integer,
	`visita_en` integer NOT NULL,
	`creado_en` integer NOT NULL,
	`enviado_en` integer,
	`cerrado_en` integer,
	`motivo_perdido` text,
	`respondio_en` integer,
	`respuesta_texto` text,
	`firma_png` text,
	`firmado_en` integer,
	`firma_ip` text,
	`firma_dispositivo` text,
	`ultimo_aviso_en` integer,
	`solicitud_id` integer,
	`plantilla_id` integer,
	FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presupuesto_numero` ON `presupuesto` (`numero`);--> statement-breakpoint
CREATE UNIQUE INDEX `presupuesto_token` ON `presupuesto` (`token`);--> statement-breakpoint
CREATE INDEX `presupuesto_estado` ON `presupuesto` (`estado`);--> statement-breakpoint
CREATE INDEX `presupuesto_cliente` ON `presupuesto` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `pulso` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `solicitud` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_nombre` text NOT NULL,
	`telefono` text,
	`email` text,
	`direccion` text NOT NULL,
	`titulo` text NOT NULL,
	`urgencia` text NOT NULL,
	`texto_original` text NOT NULL,
	`conceptos` text NOT NULL,
	`origen` text DEFAULT 'francesc' NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`presupuesto_id` integer,
	`creado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `solicitud_estado` ON `solicitud` (`estado`);--> statement-breakpoint
CREATE TABLE `tarea_programada` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presupuesto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`ejecutar_en` integer NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`asunto` text NOT NULL,
	`texto` text NOT NULL,
	`ejecutada_en` integer,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tarea_presupuesto` ON `tarea_programada` (`presupuesto_id`);--> statement-breakpoint
CREATE INDEX `tarea_pendiente` ON `tarea_programada` (`estado`,`ejecutar_en`);